let Inline = Quill.import('blots/inline');
// let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let InlineEmbed = Quill.import('blots/embed')
let SyntaxCodeBlock = Quill.import('modules/syntax')
const Tooltip = Quill.import('ui/tooltip');

console.log(SyntaxCodeBlock)



window.SyntaxCodeBlock = SyntaxCodeBlock
window.Block = Block;
// Helper function to get the blot at the cursoor position.
function getBlot(index){
    if(index === undefined) index = quill.getSelection().index;
    return quill.getLeaf(index)[0]
}

window.getBlot = getBlot

/**
 *
 * @param node
 * @param attr {'code-block': true} or {'inlinetex': true}
 * @returns {(function(*): void)|*}
 * @constructor
 */
function MathNodeMouseUpHandler(node, attr){
    return (e)=>{
        let begin = quill.getIndex(node.__blot.blot)
        let formula = node.getAttribute('latex')
        // debugger;

        quill.insertText(begin, formula, attr)
        // debugger;
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
    static create(latex, isInline = false){
        let node = super.create()
        node.contentEditable = "false"
        node.setAttribute('latex', latex);

        var mjx = MathJax.tex2svg(latex);
        node.innerHTML = mjx.outerHTML;
        window.node = node;
        if(isInline) node.style.display = "inline"

        return node;
    }

    static value(domNode){
        //     TODO

        return domNode.getAttribute('latex')
    }
}

// TODO
class BlockMath extends TexEditorBlot(BlockEmbed) {
    static create(latex) {
    //TODO
        let node = super.create(latex)

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
class TweetBlot extends  TexEditorBlot(InlineEmbed){ // supposed to be inline ..., not blockEmbed...
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

class BlockTex extends Block {

}


BlockTex.blotName = 'blocktex'
BlockTex.tagName = 'pre'
BlockTex.className = 'blocktex'




class MyToolTip extends Tooltip{
    constructor(quill, bounds) {
        super(quill, bounds);
    }
}


// This is the innerHTML of the tooltip.
// https://stackoverflow.com/questions/41131547/building-custom-quill-editor-theme
MyToolTip.TEMPLATE = `
<!--<span>hello</span>-->
<div class="ql-tooltip-arrow"></div>
<span>A template: ${MathJax.tex2svg('\\int \\mathcal{E}').outerHTML}</span>
`


class MathEditorModule{
    constructor(quill, options) {
        this.quill = quill;
        this.options = options;

        // TODO lots of refactoring needed..
        quill.on('selection-change', (range, oldRange, source)=>{
            // debugger;

            if(source !== 'user' || !range || !oldRange) return;
            let blotOld = getBlot(oldRange.index)
            let blotNew = getBlot(range.index)
            // debugger;
            let isBlockTex = (blot)=>{
                return blot.parent.constructor.className === 'ql-syntax' // TODO change this...
            }

            let isInlineTex = blot => {
                return blot.parent instanceof InlineTex
            }
            if( (isBlockTex(blotOld) && !isBlockTex(blotNew) )||
                (isInlineTex(blotOld) && !isInlineTex(blotNew))){
                let wasInline = isInlineTex(blotOld)
                console.log("you exited inline or block tex.", blotOld)
                // debugger;
                let formula = blotOld.text;
                let begin = quill.getIndex(blotOld);
                let count = formula.length;



                quill.deleteText(begin, count)
                quill.insertEmbed(begin, wasInline ? 'mathbox-inline' : 'mathbox-block', formula, Quill.sources.USER);
                tooltip.hide()

            }
            console.log(blotOld, oldRange.index, blotNew, range.index, source)

        })
        quill.on("text-change", (delta, oldDelta, source)=>{
            console.log("text changed", delta)

            if(!quill.getSelection()) return;

            let blotName = quill.getLeaf(quill.getSelection().index)[0].parent.constructor.blotName
            console.log(blotName)
            if(blotName === 'inlinetex' || blotName === 'code-block'){
                let isInline = blotName==='inlinetex'
                // debugger;
                let begin = (blotName === 'inlinetex') ? delta.ops[0].retain : delta.ops[0].retain;
                let blot = quill.getLeaf(begin)


                let formula = blot[0].text;

                tooltip.show()

                if(!isInline){
                    // tooltip.root.style.width = "100%"
                    tooltip.root.classList.add('fullwidth')

                    // let bounds = quill.getBounds(quill.getSelection().index);
                    let blot = getBlot();
                    let bounds = quill.getBounds(
                        blot.text.length + quill.getIndex(blot)
                    );
                    // debugger;
                    console.log(bounds)
                    formula = String.raw `
                        \displaylines{ ${formula} }
                    `

                    console.log(formula)


                    tooltip.root.style.top = `${bounds.bottom}px`;
                    tooltip.root.style.left = `0px`;

                    // tooltip.root.style.left = `${bounds.left}px`;
                }else{
                    if(tooltip.root.classList.contains('fullwidth')){
                        tooltip.root.classList.remove('fullwidth')
                    }
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
        })


        // quill.insertText(4, String.raw `\int_0^1 \vec{F}(\vec{r})\cdot d\vec{r}`, {inlinetex: true})


    }



}






/**
 *
 * @param name
 * @returns {f}
 * @constructor
 */
function EnterHandler(   name ) {
    let f = (range, context) => {
        //     TODO
        // debugger;
        let formula = context.prefix + context.suffix;
        console.log(formula)

        let begin = range.index - context.prefix.length;
        let count = formula.length;
        quill.deleteText(begin, count)
        quill.insertEmbed(begin, name, formula, Quill.sources.USER);
        tooltip.hide()
    }

    return f
}


// TODO probably need to get rid of these global-namespaced variables...

window.TweetBlot = TweetBlot
window.InlineTex = InlineTex
window.BlockTex = BlockTex
window.BlockMath = BlockMath
window.MyToolTip = MyToolTip
window.MathEditorModule = MathEditorModule;
window.EnterHandler = EnterHandler
