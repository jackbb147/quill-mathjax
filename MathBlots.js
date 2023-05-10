const FORMAT_BLOCKTEXEDIT = "blockwrapper"
const blockTexEditorClassName = "blocktexeditor"
const EDITOR_CONTAINER_FONTSIZE = "15px"
/**
 * How to use:
 *
 * Quill.register(Block)
 * Quill.register(BlockMath)
 * Quill.register(InlineTex)
 * Quill.register(TweetBlot);
 * Quill.register('modules/MathEditorModule', MathEditorModule)
 * let enterHandler = new EnterHandlerClass();
 * let quill = new Quill('#editor-container', {
 *     theme: "bubble",
 *     modules:{
 *         MathEditorModule: {
 *             enterHandler
 *         },
 *         keyboard:
 *             {
 *             bindings: enterHandler.getBindings()
 *         }
 *     }
 * });
 */
let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let InlineEmbed = Quill.import('blots/embed')
let SyntaxCodeBlock = Quill.import('modules/syntax')
const Tooltip = Quill.import('ui/tooltip');

console.log(SyntaxCodeBlock)

window.SyntaxCodeBlock = SyntaxCodeBlock
window.Block = Block;


// TODO refactor this somewhere else....
// Helper function to get the blot at the cursoor position.
function getBlot(index) {
    if (index === undefined) index = quill.getSelection().index;
    return quill.getLeaf(index)[0]
}

window.getBlot = getBlot

/**
 * TODO refactor this ...
 * @param formula
 */
function configureACEEditor(node, formula){
    // debugger
    // var editorNode = document.getElementsByClassName(blockTexEditorClassName)[0]
    var editorNode = node
    var editor = ace.edit(editorNode);
    var langTools = ace.require("ace/ext/language_tools");

    editor.setFontSize(EDITOR_CONTAINER_FONTSIZE) // todo refactor this
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/latex");

    var staticWordCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            // var wordList = [String.raw `\foo`, "bar", "baz"];
            var wordList  = MATHJAXCOMMANDS
            callback(null, wordList.map(function(word) {
                return {
                    caption: word,
                    value: word,
                    meta: "static"
                };
            }));

        }
    }

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        maxLines: 40 //TODO change this as needed https://stackoverflow.com/questions/11584061/automatically-adjust-height-to-contents-in-ace-cloud-9-editor
    });
    // editor.setAutoScrollEditorIntoView(true);

    editor.completers.push(staticWordCompleter)

    editor.setValue(formula)
    window.editor = editor;

    editor.commands.addCommand({
        name: 'myCommand',
        // bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
        bindKey: {win: 'Ctrl-enter',  mac: 'Command-enter'},
        exec: EnterHandlerClass.getConvertEditorToMathHandler(enterHandler), //TODO refactor this to make sure this quill instance is the right one... especially when there is more than one quill editor in the page ...
        readOnly: true, // false if this command should not apply in readOnly mode
        // multiSelectAction: "forEach", optional way to control behavior with multiple cursors
        // scrollIntoView: "cursor", control how cursor is scolled into view after the command
    });

    editor.session.on("change", (delta)=>{
        // debugger;
        // let isInline = blotName === 'inlinetex'
        // debugger;
        // let begin = (blotName === 'inlinetex') ? delta.ops[0].retain : delta.ops[0].retain;
        // let blot = quill.getLeaf(begin)


        let formula = editor.getValue()
        // debugger;

        tooltip.show() //todo refactor this

        // if (!isInline) {
            // tooltip.root.style.width = "100%"
        tooltip.root.classList.add('fullwidth')

        // debugger;
        // TODO  =========
        let bounds = quill.getBounds(
            formula.length + quill.getSelection().index
        );
        // debugger;
        console.log(bounds)
        formula = String.raw`
                    \displaylines{ ${formula} }
                `

        console.log(formula)


        tooltip.root.style.top = `${bounds.bottom}px`;
        // =============
        tooltip.root.style.left = `0px`;
        let typesetted = MathJax.tex2svg(formula);
        tooltip.root.innerHTML = `<span class="ql-tooltip-arrow"></span>${typesetted.outerHTML}`;
    })
}

/**
 *
 * @param node
 * @param attr {'code-block': true} or {'inlinetex': true}
 * @returns {(function(*): void)|*}
 * @constructor
 */
function MathNodeMouseUpHandler(node, attr) {
    return (e) => {

        // debugger;
        let begin = quill.getIndex(node.__blot.blot)
        let formula = node.getAttribute('latex')
        // debugger;

        // debugger;

        // TODO this wouldn't be an insert text. It should be an insertEmbed
        // quill.insertText(begin, formula, attr)
        quill.insertEmbed(begin, blockTexEditorClassName, true, Quill.sources.USER);
        quill.setSelection(begin, Quill.sources.SILENT);

        // == ========= editor stuff
        configureACEEditor(document.getElementsByClassName(blockTexEditorClassName)[0], formula)


        // == =========
        // set cursor position to be the beginning of the math editor
        // TODO
        // quill.setSelection(begin+1)


        node.remove()
        let formulaHTML = MathJax.tex2svg(formula);
        tooltip.show()

        tooltip.root.innerHTML = `
                <span class="ql-tooltip-arrow"></span>
                ${formulaHTML.outerHTML}
            `;
    }
}


// https://stackoverflow.com/a/62778691
let TexEditorBlot = Base => class extends Base {
    static create(latex, isInline = false) {
        let node = super.create()
        node.contentEditable = "false"
        node.setAttribute('latex', latex);

        var mjx = MathJax.tex2svg(latex);
        node.innerHTML = mjx.outerHTML;
        window.node = node;
        if (isInline) node.style.display = "inline"

        return node;
    }

    static value(domNode) {
        //     TODO

        return domNode.getAttribute('latex')
    }
}

// TODO
class BlockMath extends TexEditorBlot(BlockEmbed) {
    static create(latex) {
        //TODO
        let node = super.create(latex)


        // debugger
        node.addEventListener('mouseup', MathNodeMouseUpHandler(node, {
            'code-block': true
        }))
        return node;
    }
}

BlockMath.tagName = 'div'
BlockMath.className = 'mathbox-block'
BlockMath.blotName = 'mathbox-block'


// TODO change the name of this ...
class TweetBlot extends TexEditorBlot(InlineEmbed) { // supposed to be inline ..., not blockEmbed...
    static create(latex) {

        let node = super.create(latex, true);
        let mathNode = node.firstChild;
        mathNode.removeAttribute("display")
        mathNode.style["math-style"] = "normal"
        node.addEventListener('mouseup',
            MathNodeMouseUpHandler(node, {
                'inlinetex': true
            })
        )

        return node;
    }

}

TweetBlot.blotName = 'mathbox-inline';
TweetBlot.tagName = 'div';
TweetBlot.className = 'mathbox-inline';


class InlineTex extends Inline {

}

InlineTex.blotName = 'inlinetex'
InlineTex.tagName = 'code'
InlineTex.className = 'inlinetex'
class MyToolTip extends Tooltip {
    constructor(quill, bounds) {
        super(quill, bounds);
    }
}


// This is the innerHTML of the tooltip
// https://stackoverflow.com/questions/41131547/building-custom-quill-editor-theme
MyToolTip.TEMPLATE = `
<!--<span>hello</span>-->
<div class="ql-tooltip-arrow"></div>
<span>A template: ${MathJax.tex2svg('\\int \\mathcal{E}').outerHTML}</span>
`


class MathEditorModule {
    constructor(quill, options) {

        if (!options.hasOwnProperty('enterHandler')) {
            throw new Error('No enterHandler supplied. ')
        }
        this.quill = quill;
        this.options = options;

        // TODO some refactoring needed..
        quill.on('selection-change', this.handleSelectionChange.bind(this))
        quill.on("text-change", this.handleTextChange.bind(this))

        let tooltip = new MyToolTip(quill);
        tooltip.root.classList.add("math-tooltip")


        window.tooltip = tooltip
        window.quill = quill;


        let enterHandler = options.enterHandler;
        enterHandler.setQuillInstance(quill)
        enterHandler.setTooltipInstance(tooltip)

    }


    handleTextChange(delta, oldDelta, source) {
        if(source !== 'user') return;
        console.log("text changed", delta, this)

        let quill = this.quill;
        if (!quill.getSelection()) return;

        let blot = quill.getLeaf(quill.getSelection().index)[0]
        // debugger;
        let blotName = blot.parent.constructor.blotName
        // console.log(blotName)
        if (blotName === 'inlinetex' || blotName === 'code-block') {
            let isInline = blotName === 'inlinetex'
            // debugger;
            let begin = (blotName === 'inlinetex') ? delta.ops[0].retain : delta.ops[0].retain;
            // let blot = quill.getLeaf(begin)


            let formula = blot.text;
            // debugger;
            tooltip.show()

            if (!isInline) {
                // tooltip.root.style.width = "100%"
                tooltip.root.classList.add('fullwidth')

                // let bounds = quill.getBounds(quill.getSelection().index);
                let blot = getBlot();
                // debugger;
                let bounds = quill.getBounds(
                    blot.text.length + quill.getIndex(blot)
                );
                // debugger;
                console.log(bounds)
                formula = String.raw`
                        \displaylines{ ${formula} }
                    `

                console.log(formula)


                tooltip.root.style.top = `${bounds.bottom}px`;
                tooltip.root.style.left = `0px`;

                // tooltip.root.style.left = `${bounds.left}px`;
            } else {
                if (tooltip.root.classList.contains('fullwidth')) {
                    tooltip.root.classList.remove('fullwidth')
                }
                // debugger;
                let bounds = quill.getBounds(quill.getIndex(getBlot()));

                console.log(bounds)


                tooltip.root.style.top = `${bounds.bottom}px`;
                tooltip.root.style.left = `${bounds.left}px`;
            }

            let typesetted = MathJax.tex2svg(formula);
            tooltip.root.innerHTML = `
                    <span class="ql-tooltip-arrow"></span>
                    ${typesetted.outerHTML}
                `;
        }
    }

    handleSelectionChange(range, oldRange, source) {
        // debugger;

        if (source !== 'user' || !range || !oldRange) return;
        let blotOld = getBlot(oldRange.index)
        let blotNew = getBlot(range.index)
        // debugger;
        let isBlockTex = (blot) => {
            return blot.parent.constructor.className === 'ql-syntax' // TODO change this...
        }

        let isInlineTex = blot => {
            return blot.parent instanceof InlineTex
        }
        if ((isBlockTex(blotOld) && !isBlockTex(blotNew)) ||
            (isInlineTex(blotOld) && !isInlineTex(blotNew))) {
            let wasInline = isInlineTex(blotOld)
            console.log("you exited inline or block tex.", blotOld)
            // debugger;
            let formula = blotOld.text;
            let begin = quill.getIndex(blotOld);
            let count = formula.length;



            quill.deleteText(begin, count, 'silent')
            quill.insertEmbed(begin, wasInline ? 'mathbox-inline' : 'mathbox-block', formula, Quill.sources.USER);
            tooltip.hide()

        }
        // console.log(blotOld, oldRange.index, blotNew, range.index, source)

    }
}


class EnterHandlerClass {
    constructor() {

    }

    setQuillInstance(quill) {
        this.quill = quill;
    }

    setTooltipInstance(tooltip) {
        this.tooltip = tooltip;
    }

    static getConvertEditorToMathHandler(enterHandler){
        let _ = enterHandler;
        /**
         *
         * @param editor
         */
        let f = (editor) => {

            // debugger;

            let quill = _.quill
            let tooltip = _.tooltip;
            // TODO get the right formula
            let formula = editor.getValue() //todo
            console.log("hey! you wanna typeset the formula? ")
            // debugger;
            console.log(formula)

            let count = formula.length;

            let indexOfEditor = quill.getSelection().index;
            quill.deleteText(indexOfEditor, 1)

            // debugger;
            quill.insertEmbed(indexOfEditor, "mathbox-block", formula, "silent");
            tooltip.hide()
        }
        return f
    }

    // TODO rename this
    getHandler(name) {
        //
        let _ = this;
        let f = (range, context) => {
            //     TODO
            // debugger;

            let quill = _.quill,
                tooltip = _.tooltip;
            let formula = context.prefix + context.suffix;

            console.log("hey! you wanna typeset the formula? ")
            // debugger;
            console.log(formula)

            let begin = range.index - context.prefix.length;
            let count = formula.length;

            // debugger;
            quill.removeFormat(begin)
            quill.deleteText(begin, count, "silent")

            quill.insertEmbed(begin, name, formula, "silent");
            tooltip.hide()
        }

        return f;
    }

    getBindings() {
        let _ = this;

        return {
            // TODO is there a way to somehow propagate the keyboard event from the ace editor up to the enclosing quill instance?
            // blocktexEdit: {
            //     key: "enter",
            //     metaKey: true,
            //     format: [FORMAT_BLOCKTEXEDIT],
            //     handler: (range, context)=>{
            //         alert("hey from quill!")
            //     }
            // },
            cmd_enter: {
                key: 'enter',
                metaKey: true,
                format: ['code-block'],
                handler: _.getHandler('mathbox-block')
            },
            enter: {
                key: 'enter',
                format: ['inlinetex'],
                metaKey: null,
                handler: _.getHandler('mathbox-inline')
            },
            startBlockMathEdit:{
                key: 'enter',
                handler: (range, context)=>{
                    // alert("hey!")
                    let quill = _.quill;
                    let prefix = context.prefix;
                    let lastTwo = prefix.slice(-2);
                    let index = range.index;
                    let offset = context.offset;
                    console.log("Hey, you pressed enter. ", range, context, lastTwo, quill.getLine(index))

                    if(lastTwo === '$$'){

                        if(offset === 2){
                            quill.format('code-block', true)
                            quill.deleteText(index-2, 2)

                        }else{
                            // alert("hey! no!")

                            quill.deleteText(index-2, 2)
                            index = index - 2;
                            quill.insertText(index, `\n`)
                            quill.format('code-block', true)


                        }
                        return false;
                    }
                    return true;
                }
            },
            backspace: {
                key: 'backspace',
                format: ['inlinetex', 'code-block'],
                handler: (range, context)=>{
                    console.log("hey!")
                    console.log("backspace pressed while editing latex. ",range, context)
                    let prefix = context.prefix;
                    if(context.format.hasOwnProperty("code-block")){

                        if(prefix.length < 1){
                            // User is about to exit formula editor  ...
                            console.log("hey! You wanna delete me?")
                            quill.removeFormat(quill.getSelection().index)
                            _.tooltip.hide()
                        }
                    }else{
                        if(prefix.length < 2){
                            // User is about to exit formula editor  ...
                            console.log("hey! You wanna delete me?")
                            _.tooltip.hide()
                        }
                    }

                    return true;
                }
            },
            startInlineMathEdit: {
                key: 52,
                shiftKey: true,
                handler: ()=>{
                    console.log("hey! dollar sign pressed")
                    // return true;
                //     TODO
                    let index = _.quill.getSelection().index;
                    let quill = _.quill;
                    quill.insertText(index, '$$')
                    quill.setSelection(index+1)


                    // var res = true;
                    quill.once('text-change', (delta, oldDelta, source)=>{
                        console.log("hey!")
                        console.log(delta, oldDelta, source)

                        let ops1 = delta.ops[1]; // todo change this name...

                        if(ops1.hasOwnProperty("insert")){
                            console.log("hey! you wanna edit latex?")
                            let text =  ' ' + ops1.insert;
                            quill.deleteText(index, 2 + text.length)
                            quill.insertText(index, text, {'inlinetex': true})
                            quill.setSelection(index+2)
                        }else if(ops1.hasOwnProperty("delete")){
                            console.log("hey! you dont wanna edit latex anymore?")
                            quill.deleteText(index, 1)
                        }
                    })



                }
            }
            // left: {
            //     key: 37,
            //     handler: (range, context)=>{
            //         console.log("left pressed", range, context)
            //
            //         return true;
            //     }
            // }
        };
    }


}


class BlockTexEditor extends BlockEmbed{
    // constructor() {
    //     super();
    // }

    /**
     *
     * @param value{String} latex source code
     * @returns {*}
     */
    static create(value=""){
        let node = super.create();
        // TODO
        node.setAttribute("latex", value)
        return node
    }

    static value(node){
        return node.getAttribute("latex")
    }

    // This method hooks up the keybindings to this embed.
    formats(){
        let res = {}
        res[FORMAT_BLOCKTEXEDIT] = true
        return res
    }

    // format(name, value){
    //     debugger;
    //
    // }


}

BlockTexEditor.blotName = 'blocktexeditor';
BlockTexEditor.tagName = 'div';
BlockTexEditor.className = 'blocktexeditor'







class BlockWrapper extends Block {

}

BlockWrapper.blotName = 'blockwrapper'
BlockWrapper.tagName = 'div'
BlockWrapper.className = 'blockwrapper'

// TODO probably need to get rid of these global-namespaced variables...
window.BlockWrapper = BlockWrapper
window.BlockTexEditor = BlockTexEditor
window.TweetBlot = TweetBlot
window.InlineTex = InlineTex
window.BlockMath = BlockMath
window.MyToolTip = MyToolTip
window.MathEditorModule = MathEditorModule;


window.EnterHandlerClass = EnterHandlerClass


