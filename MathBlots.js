let Inline = Quill.import('blots/inline');
// let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let InlineEmbed = Quill.import('blots/embed')
let Container = Quill.import("blots/container")
let TextBlot = Quill.import("blots/text")
let Break = Quill.import('blots/break')



window.Block = Block;
// Helper function to get the blot at the cursoor position.
function getBlot(index){
    if(index === undefined) index = quill.getSelection().index;
    return quill.getLeaf(index)[0]
}

window.getBlot = getBlot
// TODO
class BlockMath extends BlockEmbed {
    static create(latex) {
    //TODO
        let node = super.create()
        node.contentEditable = "false"
        node.setAttribute('latex', latex);

        var mjx = MathJax.tex2svg(latex);
        node.innerHTML = mjx.outerHTML;

        window.node = node;

        node.addEventListener('mouseup', (e)=>{
            // debugger;
            let begin = quill.getIndex(node.__blot.blot)
            let formula = node.getAttribute('latex')
            // debugger;


            quill.insertText(begin, formula, {'code-block': true})
            // debugger;
            node.remove()

            let formulaHTML = MathJax.tex2svg(latex);
            tooltip.show()

            tooltip.root.innerHTML = `
            <span class="ql-tooltip-arrow"></span>
            ${formulaHTML.outerHTML}
        `;
            // // debugger;
            // let bounds = quill.getBounds(quill.getIndex(getBlot()));
            //
            // console.log(bounds)
            //
            //
            // tooltip.root.style.top = `${bounds.bottom}px`;
            // tooltip.root.style.left = `${bounds.left}px`;



        })

        return node;
    }

    static value(domNode){
    //     TODO
    }


}

BlockMath.tagName = 'div'
BlockMath.className = 'mathbox-block'
BlockMath.blotName = 'mathbox-block'
    /**
     * TweetBlot.blotName = 'mathbox-inline';
     * TweetBlot.tagName = 'div';
     * TweetBlot.className = 'mathbox-inline';
     */





// TODO change the name of this ...
class TweetBlot extends  InlineEmbed {
    static create(latex) {

        // tooltip.hide()
        let node = super.create();


        node.contentEditable = "false"



        node.style.display = "inline"
        // node.style.border = "1px solid red"


        node.setAttribute('latex', latex);
        // var mjx = MathJax.tex2svg(latex);
        var mjx = MathJax.tex2svg(latex);
        // node.appendChild(mjx)
        node.innerHTML = mjx.outerHTML;
        // debugger;
        let mathNode = node.firstChild;
        mathNode.removeAttribute("display")
        mathNode.style["math-style"] = "normal"
        // node.setAttribute('editing', 'false')



        node.addEventListener('mouseup', (e)=>{
            // debugger;
            let begin = quill.getIndex(node.__blot.blot)
            let formula = node.getAttribute('latex')
            // debugger;


            quill.insertText(begin, formula, {inlinetex: true})
            node.remove()
            let formulaHTML = MathJax.tex2svg(latex);
            tooltip.show()
            tooltip.root.innerHTML = formulaHTML.outerHTML;
            // debugger;
            let bounds = quill.getBounds(quill.getIndex(getBlot()));

            console.log(bounds)


            tooltip.root.style.top = `${bounds.bottom}px`;
            tooltip.root.style.left = `${bounds.left}px`;



        })

        //
        // let mathNode = node.firstChi;
        // mathNode.removeAttribute("display")
        // mathNode.style["math-style"] = "normal"
        window.node = node;


        return node;
    }







    static value(domNode) {
        return domNode.getAttribute('latex')
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



// window.PreviewBlock = PreviewBlock
window.TweetBlot = TweetBlot
window.InlineTex = InlineTex
window.BlockTex = BlockTex
window.BlockMath = BlockMath

