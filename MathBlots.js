let Inline = Quill.import('blots/inline');
// let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let InlineEmbed = Quill.import('blots/embed')
let SyntaxCodeBlock = Quill.import('modules/syntax')

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
        node.contentEditable = "false"
        node.setAttribute('latex', latex);

        var mjx = MathJax.tex2svg(latex);
        node.innerHTML = mjx.outerHTML;
        window.node = node;
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

        // debugger;
        // tooltip.hide()
        let node = super.create(latex, true);
        node.style.display = "inline"
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


    // static value(domNode) {
    //     return domNode.getAttribute('latex')
    // }
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



// window.PreviewBlock = PreviewBlock
window.TweetBlot = TweetBlot
window.InlineTex = InlineTex
window.BlockTex = BlockTex
window.BlockMath = BlockMath

