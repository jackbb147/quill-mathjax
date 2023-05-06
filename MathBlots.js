let Inline = Quill.import('blots/inline');
let BlockEmbed = Quill.import('blots/block/embed');
let InlineEmbed = Quill.import('blots/embed')


// Helper function to get the blot at the cursoor position.
function getBlot(index){
    if(index === undefined) index = quill.getSelection().index;
    return quill.getLeaf(index)[0]
}

window.getBlot = getBlot
// TODO
class BlockMath extends BlockEmbed {
    static create(latex) {

    }
}






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
            tooltip.root.style["border-radius"] = "5px"
            tooltip.root.style.padding = "5px"
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


window.TweetBlot = TweetBlot
window.InlineTex = InlineTex
window.BlockMath = BlockMath