const FORMAT_BLOCKTEXEDIT = "blockwrapper"
const BLOCK_TEX_EDITOR_CLASSNAME = "blocktexeditor" //todo change this variable name
const INLINE_TEX_EDITOR_CLASSNAME = "inlinetexeditor"
const EDITOR_CONTAINER_FONTSIZE = "15px" // QUILL'S EDITOR_CONTAINER FONT SIZE MUST BE KEPT IN SYNC WITH ACE'S EDITOR FONT SIZE, OTHERWISE TOOLTIP POSITIONING WILL BE OFF
const Scroll = Quill.import("blots/scroll")
/**
 * How to use:
 *
 * Quill.register(Block)
 * Quill.register(BlockMathDisplay)
 * Quill.register(InlineMathDisplay);
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

window.SyntaxCodeBlock = SyntaxCodeBlock
window.Block = Block;


// TODO refactor this somewhere else....
// Helper function to get the blot at the cursoor position.
function getBlot(index) {
    if (index === undefined) index = quill.getSelection().index;
    return quill.getLeaf(index)[0]
}

function getACEEditorInstance(domNode) {
//     TODO
//     debugger
    var x = domNode
    while (!x.env || !x.env.editor) {
        x = x.parentNode
    }

    return x.env.editor

}

window.getBlot = getBlot

// returns true if the given node is an inlineTexEdit blot; false otherwise.
function isInlineTexEditBlot(domNode) {
//     debugger;
    try {
        let x = domNode
        let blot = Quill.find(x)
        while (!(blot instanceof Scroll) && x.parentNode) {
            if (blot instanceof InlineTexEditor) return true
            x = x.parentNode;
            blot = Quill.find(x)
            if (!x || !x.parentNode) throw {
                error: "x or x.parentNode is bad. ",
                x,
                parentNode: x.parentNode,
                blot
            }
        }
        return false
    } catch (e) {
        throw {
            caughtError: e
        }
    }
}

// returns true if the given node is a blockTexEdit blot; false otherwise.
function isBlockTexEditBlot(domNode) {
//     TODO
//     debugger;
    try {
        let x = domNode
        let blot = Quill.find(x)
        while (!(blot instanceof Scroll) && x.parentNode) {
            if (blot instanceof BlockTexEditor) return true
            x = x.parentNode;
            blot = Quill.find(x)
            if (!x || !x.parentNode) throw {
                error: "x or x.parentNode is bad. ",
                x,
                parentNode: x.parentNode,
                blot
            }
        }
        return false
    } catch (e) {
        throw {
            caughtError: e
        }
    }
}


function findQuill(node) {
    while (node) {
        const quill = Quill.find(node);
        if (quill instanceof Quill) return quill;
        node = node.parentElement;
    }
}

// https://stackoverflow.com/a/62778691
/**
 * Displays typesetted math symbols, like "F = ma"
 * @param Base
 * @return {{value(*): *, create(*, boolean=): *, new(): {}, prototype: {}}}
 * @constructor
 */
let MathDisplayBlot = Base => class extends Base {
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

class BlockMathDisplay extends MathDisplayBlot(BlockEmbed) {
    static tagName = 'div'
    static className = 'mathbox-block'
    static blotName = 'mathbox-block'


    static create(latex) {
        //TODO
        let node = super.create(latex)
        //
        node.addEventListener('mouseup', BlockMathDisplay.MouseUpHandler(node, {
            'code-block': true // todo get rid of this 'code-block'
        }))
        return node;
    }

    /**
     * convert a mathjax block into a tex edit block.
     * @param node
     * @param attr {'code-block': true} or {'inlinetex': true}
     * @returns {(function(*): void)|*}
     * @constructor
     */
    static MouseUpHandler(node, attr) {
        // TODO find the math editor module instance
        return (e) => {
            let math_editor_module = findQuill(node).getModule("MathEditorModule")
            math_editor_module.replaceBlockMathWithBlockEdit(node, quill, attr)
        }
    }

}

class InlineMathDisplay extends MathDisplayBlot(InlineEmbed) { // supposed to be inline ..., not blockEmbed...
    static blotName = 'mathbox-inline';
    static tagName = 'div';
    static className = 'mathbox-inline';

    static create(latex) {
        let node = super.create(latex, true);
        let mathNode = node.firstChild;
        mathNode.removeAttribute("display")
        mathNode.style["math-style"] = "normal"
        node.addEventListener('mouseup',
            // TODO find the math editor module instance
            () => {
                let math_editor_module = findQuill(node).getModule("MathEditorModule")
                math_editor_module.replaceInlineMathWithInlineEdit(node, quill)
            }
        )
        return node;
    }
}


class MyToolTip extends Tooltip {
    // This is the innerHTML of the tooltip
// https://stackoverflow.com/questions/41131547/building-custom-quill-editor-theme
    static TEMPLATE = `
<!--<span>hello</span>-->
<div class="ql-tooltip-arrow"></div>
<span>A template: ${MathJax.tex2svg('\\int \\mathcal{E}').outerHTML}</span>
`

    constructor(quill, bounds) {
        super(quill, bounds);
    }
}


class InlineTexEditor extends InlineEmbed {
    static blotName = INLINE_TEX_EDITOR_CLASSNAME
    static className = INLINE_TEX_EDITOR_CLASSNAME
    static tagName = 'div';

    static create(value = "") {

        //  ;
        let node = super.create();
        var node_wrappernode = document.createElement("div")

        node_wrappernode.classList.add("inline-editor-wrapper")
        node.appendChild(node_wrappernode)


        node.setAttribute("latex", value)
        node.setAttribute("isInlineTexEditor", true)
        node.style.display = "inline" // todo moe this to a css file

        node_wrappernode.style.display = "inline-block"
        node_wrappernode.style["vertical-align"] = "middle";
        node_wrappernode.style.width = "1px"; // default width

        window.node_wrappernode = node_wrappernode


        return node
    }

    static value(node) {
        return node.getAttribute("latex")
    }

}

class BlockTexEditor extends BlockEmbed {
    static blotName = BLOCK_TEX_EDITOR_CLASSNAME;
    static tagName = 'div';
    static className = BLOCK_TEX_EDITOR_CLASSNAME

    // constructor() {
    //     super();
    // }

    /**
     *
     * @param value{String} latex source code
     * @returns {*}
     */
    static create(value = "") {
        let node = super.create();
        // TODO
        node.setAttribute("latex", value)
        node.setAttribute("isBlockTexEditor", true)
        return node
    }

    static value(node) {
        return node.getAttribute("latex")
    }

    // This method hooks up the keybindings to this embed.
    formats() {
        let res = {}
        res[FORMAT_BLOCKTEXEDIT] = true
        return res
    }

    // format(name, value){
    //      ;
    //
    // }


}


class BlockWrapper extends Block {
    static blotName = 'blockwrapper'
    static tagName = 'div'
    static className = 'blockwrapper'
}


class MathEditorModule {
    constructor(quill, options) {
        // if (!options.hasOwnProperty('enterHandler')) {
        //     throw new Error('No enterHandler supplied. ')
        // }
        this.quill = quill;
        this.tooltip = new MyToolTip(quill);
        this.options = options;
        this.clicked = null; // a dom node
        this.clickedInlineTexEditor = false // whether the domNode is an inline tex editor
        this.clickedBlockTexEditor = false
        this.lastClickedIndex = null;  //index of the last clicked item

        quill.root.addEventListener("click", ev => {
            // debugger
            let clicked = ev.target, lastClicked = this.clicked
            let isInlineTexEditor = isInlineTexEditBlot(clicked);
            let isBlockTexEditor = isBlockTexEditBlot(clicked) //todo
            if (!isInlineTexEditor && this.clickedInlineTexEditor) {
                // User is clicking away from an inline tex editor...
                // debugger;
                let editor = getACEEditorInstance(lastClicked)
                let formula = editor.getValue()
                //  ;
                let begin = this.lastClickedIndex
                let count = 1
                quill.deleteText(begin, count, 'silent')
                quill.insertEmbed(begin, 'mathbox-inline', formula, Quill.sources.USER);
                this.tooltip.hide()
            } else if (!isBlockTexEditor && this.clickedBlockTexEditor) {
                // User is clicking away from a block tex editor...
                let editor = getACEEditorInstance(lastClicked)
                let formula = editor.getValue()
                //  ;
                let begin = this.lastClickedIndex
                let count = 1
                quill.deleteText(begin, count, 'silent')
                quill.insertEmbed(begin, 'mathbox-block', formula, Quill.sources.USER);
                this.tooltip.hide()
            }


            // update
            this.clicked = clicked
            this.clickedInlineTexEditor = isInlineTexEditor
            this.clickedBlockTexEditor = isBlockTexEditor
            this.lastClickedIndex = quill.getSelection().index
        })
        // TODO some refactoring needed..
        this.tooltip.root.classList.add("math-tooltip")
        window.quill = quill;
    }

    // for inline ace editor auto resizing
    // numChars: number of characters. If undefined, use renderer.characterWidth
    updateSize(e, renderer, numChars) {
        // debugger
        var text = renderer.session.getLine(0);
        var chars = renderer.session.$getStringScreenWidth(text)[0];

        var width = Math.max(chars, 2) * (renderer.characterWidth) // text size
            + 2 * renderer.$padding // padding
            + 2 // little extra for the cursor
            + 0 // add border width if needed

        // update container size
        renderer.container.style.width = width + "px";
        // update computed size stored by the editor
        renderer.onResize(false, 0, width, renderer.$size.height);
    }


    /**
     * insert an ACE editor at the specified index of the quill instance.
     * @param index
     * @param latex the default text input to feed into the editor
     */
    insertBlockTexEditor(index, latex) {
        // quill.insertText(begin, formula, attr)
        let res = quill.insertEmbed(index, BLOCK_TEX_EDITOR_CLASSNAME, true, Quill.sources.USER);
        // == ========= editor stuff
        let editor = this.configureACEEditor(document.getElementsByClassName(BLOCK_TEX_EDITOR_CLASSNAME)[0], latex)
    }

    /**
     * @param index
     * @param latex
     */
    insertInlineTexEditor(index, latex) {
        //  ;
        let res = quill.insertEmbed(index, INLINE_TEX_EDITOR_CLASSNAME, latex, Quill.sources.USER);
        this.configureACEEditor(node_wrappernode, latex, true)

        //  for some reason this must be done in order to avoid cursor being
        //  reset to the beginning of line. https://github.com/quilljs/quill/issues/731#issuecomment-326843147
        setTimeout(function () {
            // editor.setValue("")
            editor.focus()
        }, 0);
    }


    /**
     * @param formula
     * @param isInline {Boolean}
     */
    configureACEEditor(node, formula = "", isInline = false) {
        // var editorNode = document.getElementsByClassName(BLOCK_TEX_EDITOR_CLASSNAME)[0]
        var editorNode = node

        // debugger
        var editor = ace.edit(editorNode);
        var langTools = ace.require("ace/ext/language_tools");
        // editor.focus()
        editor.setFontSize(EDITOR_CONTAINER_FONTSIZE) // todo refactor this
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/latex");
        editor.focus()
        var staticWordCompleter = {
            getCompletions: function (editor, session, pos, prefix, callback) {
                // var wordList = [String.raw `\foo`, "bar", "baz"];
                var wordList = MATHJAXCOMMANDS
                callback(null, wordList.map(function (word) {
                    return {
                        caption: word,
                        value: word,
                        meta: "static"
                    };
                }));

            }
        }

        editor.setOptions({
            showGutter: !isInline,
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            maxLines: 40, //TODO change this as needed https://stackoverflow.com/questions/11584061/automatically-adjust-height-to-contents-in-ace-cloud-9-editor

            // fontSize: EDITOR_CONTAINER_FONTSIZE

        });
        editor.setFontSize(15)
        editor.renderer.updateCharacterSize()

        //  ;
        // editor.setAutoScrollEditorIntoView(true);

        editor.completers.push(staticWordCompleter)


        window.editor = editor;

        editor.commands.addCommand({
            name: 'myCommand',
            bindKey: {win: 'Ctrl-enter', mac: 'Command-enter'},
            // TODO modify this for inline
            exec: this.getConvertEditorToMathHandler(isInline), //TODO refactor this to make sure this quill instance is the right one... especially when there is more than one quill editor in the page ...
            readOnly: true, // false if this command should not apply in readOnly mode
            // multiSelectAction: "forEach", optional way to control behavior with multiple cursors
            // scrollIntoView: "cursor", control how cursor is scolled into view after the command
        });

        let quill = this.quill, tooltip = this.tooltip

        editor.session.on("change", (delta) => {

            let formula = editor.getValue()

            tooltip.show() //todo refactor this

            // if (!isInline) {
            // tooltip.root.style.width = "100%"
            tooltip.root.classList.add('fullwidth')

            //  ;
            // TODO  =========
            let bounds = quill.getBounds(
                formula.length + quill.getSelection().index
            );
            //  ;
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

            if (isInline) {

                this.updateSize(null, editor.renderer)
                editor.focus()
                // editor.getSession()._emit('change', {start:{row:0,column:0},end:{row:0,column:0},action:'insert',lines: []})
            }


        })

        editor.insert(formula)


        return editor;
    }

    getConvertEditorToMathHandler(isInline = false) {
        let _ = this;

        /**
         *
         * @param editor
         */
        /**
         * replace an editor block with a typesetted math displayer block by
         * deleting and then inserting. Also hides the tooltip.
         * @param editor
         */
        let f = (editor) => {
            // debugger
            let quill = _.quill
            let tooltip = _.tooltip;
            // TODO get the right formula
            let formula = editor.getValue() //todo
            console.log("hey! you wanna typeset the formula? ", formula)
            let indexOfEditor = quill.getSelection().index;
            //
            quill.deleteText(indexOfEditor, 1)
            quill.insertEmbed(indexOfEditor, isInline ? "mathbox-inline" : "mathbox-block", formula, "silent");
            tooltip.hide()
        }
        return f
    }

    /**
     * @param blockMathNode
     * @param quill
     * @param attr
     */
    replaceBlockMathWithBlockEdit(blockMathNode, quill, attr) {
        let node = blockMathNode
        let begin = quill.getIndex(node.__blot.blot)
        let formula = node.getAttribute('latex')
        this.insertBlockTexEditor(begin, formula)
        node.remove()
        let formulaHTML = MathJax.tex2svg(formula);
        this.tooltip.show()
        this.tooltip.root.innerHTML = `
                <span class="ql-tooltip-arrow"></span>
                ${formulaHTML.outerHTML}
            `;
    }

    /**
     * @param mathnode
     * @param quill
     * @param attr
     */
    replaceInlineMathWithInlineEdit(mathnode, quill, attr) {
        //  ;
        let node = mathnode
        let begin = quill.getIndex(node.__blot.blot)
        let formula = node.getAttribute('latex')

        // TODO this wouldn't be an insert text. It should be an insertEmbed
        this.insertInlineTexEditor(begin, formula)
        node.remove()
        let formulaHTML = MathJax.tex2svg(formula);
        this.tooltip.show()

        this.tooltip.root.innerHTML = `
                <span class="ql-tooltip-arrow"></span>
                ${formulaHTML.outerHTML}
            `;
    }

    static getBindings() {
        return {
            // https://quilljs.com/docs/modules/keyboard/
            startBlockMathEdit: {
                key: 'enter',
                handler: function (range, context) {
                    // alert("hey!")
                    let quill = this.quill;
                    let math_editor_module = this.quill.getModule("MathEditorModule");
                    if (!math_editor_module) throw new Error("No math editor module instance found. ")
                    //
                    let prefix = context.prefix;
                    let lastTwo = prefix.slice(-2);
                    let index = range.index;
                    let offset = context.offset;
                    console.log("Hey, you pressed enter. ", range, context, lastTwo, quill.getLine(index))

                    if (lastTwo === '$$') {
                        if (offset === 2) {
                            quill.deleteText(index - 2, 2)
                            math_editor_module.insertBlockTexEditor(index - 2, "")
                        } else {
                            // alert("hey! no!")
                            quill.deleteText(index - 2, 2)
                            index = index - 2;
                            quill.insertText(index, `\n`)
                            math_editor_module.insertBlockTexEditor(index + 1, "")
                        }
                        return false;
                    }
                    return true;
                }
            },
            backspace: {
                key: 'backspace',
                format: ['inlinetex', 'code-block'],
                handler: function (range, context) {
                    let quill = this.quill
                    console.log("hey!")
                    console.log("backspace pressed while editing latex. ", range, context)
                    let prefix = context.prefix;
                    if (context.format.hasOwnProperty("code-block")) {

                        if (prefix.length < 1) {
                            // User is about to exit formula editor  ...
                            console.log("hey! You wanna delete me?")
                            quill.removeFormat(quill.getSelection().index)
                            _.tooltip.hide()
                        }
                    } else {
                        if (prefix.length < 2) {
                            // User is about to exit formula editor  ...
                            console.log("hey! You wanna delete me?")
                            _.tooltip.hide()
                        }
                    }

                    return true;
                }
            },

            dollarSign: {
                key: 52,
                shiftKey: true,
                handler: function (range, context) {
                    console.log("hey! dollar sign pressed")
                    // debugger
                    let quill = this.quill;
                    let math_editor_module = this.quill.getModule("MathEditorModule");
                    if (!math_editor_module) throw new Error("No math editor module instance found. ")
                    let index = quill.getSelection().index;
                    quill.insertText(index, '$$')
                    quill.setSelection(index + 1)

                    quill.once('text-change', (delta, oldDelta, source) => {
                        console.log("hey!")
                        console.log(delta, oldDelta, source)
                        // debugger
                        let ops1 = delta.ops[1]; // todo change this name...

                        if (ops1.hasOwnProperty("insert")) {
                            let formula = ops1.insert
                            // alert("hey! you wanna edit latex?")

                            // debugger;
                            quill.deleteText(index, 3)
                            // debugger
                            math_editor_module.insertInlineTexEditor(index, formula)


                            // quill.setSelection(index+1)
                            // return false

                            // let text =  ' ' + ops1.insert;
                            // quill.deleteText(index, 2 + text.length)
                            // //  ;
                            // quill.insertText(index, text, {'inlinetex': true})
                            // quill.setSelection(index+2)
                        } else if (ops1.hasOwnProperty("delete")) {
                            console.log("hey! you dont wanna edit latex anymore?")
                            quill.deleteText(index, 1)
                        }
                    })
                }
            },
        };
    }

}