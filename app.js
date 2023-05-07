



const Tooltip = Quill.import('ui/tooltip');

window.TT = Tooltip

// let Text = Quill.import('blots/block/text')
// window.Text = Text
class BoldBlot extends Inline { }
BoldBlot.blotName = 'bold';
BoldBlot.tagName = 'strong';

class ItalicBlot extends Inline { }
ItalicBlot.blotName = 'italic';
ItalicBlot.tagName = 'em';

class LinkBlot extends Inline {
    static create(url) {
        let node = super.create();
        node.setAttribute('href', url);
        node.setAttribute('target', '_blank');
        return node;
    }

    static formats(node) {
        return node.getAttribute('href');
    }
}
LinkBlot.blotName = 'link';
LinkBlot.tagName = 'a';



class HeaderBlot extends Block {
    static formats(node) {
        return HeaderBlot.tagName.indexOf(node.tagName) + 1;
    }
}
HeaderBlot.blotName = 'header';
HeaderBlot.tagName = ['H1', 'H2'];

class DividerBlot extends BlockEmbed { }
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';

class TexBlot extends InlineEmbed {

}

/**
 * TweetBlot.blotName = 'mathbox-inline';
 * TweetBlot.tagName = 'div';
 * TweetBlot.className = 'mathbox-inline'; */
TexBlot.blotName = 'texblot'
TexBlot.tagName = 'code'
TexBlot.className = 'texblot'


class BlockquoteBlot extends Block { }
BlockquoteBlot.blotName = 'blockquote';
BlockquoteBlot.tagName = 'blockquote';

window.BlockquoteBlot = BlockquoteBlot



Quill.register(Block)
Quill.register(BlockMath)
Quill.register(BlockTex)
Quill.register(InlineTex)
Quill.register(BoldBlot);
Quill.register(ItalicBlot);
Quill.register(LinkBlot);
Quill.register(BlockquoteBlot);
Quill.register(HeaderBlot);
Quill.register(DividerBlot);
Quill.register(TweetBlot);
Quill.register(TexBlot)




let quill = new Quill('#editor-container', {
    theme: "bubble",
    modules:{
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block']
        ],
        keyboard: {
            bindings:{
                cmd_enter:{
                    key: 'enter',
                    format:['code-block'],
                    metaKey: true,
                    handler: (range, context)=>{
                        // alert("hey!")
                    //     TODO refactor this... can combine the two handler functions somehow
                        let formula = context.prefix + context.suffix;
                        console.log(formula)

                        let begin = range.index - context.prefix.length;
                        let count = formula.length;
                        quill.deleteText(begin, count)
                        quill.insertEmbed(begin, 'mathbox-block', formula, Quill.sources.USER);
                        tooltip.hide()
                    }
                },
                enter: {
                    key: 'enter',
                    format:['inlinetex'],
                    handler: function(range, context) {
                        // alert("enter fired!")
                        let formula = context.prefix + context.suffix;
                        console.log("enter fired in inlinetex",range, context, formula, formula.length)
                        // var mjx = MathJax.tex2svg(formula);
                        tooltip.hide()
                        let begin = range.index - context.prefix.length;
                        let count = formula.length;
                        // console.log("begin: ", begin, " count: ", count , mjx)
                        quill.deleteText(begin, count)
                        quill.insertEmbed(begin, 'mathbox-inline', formula, Quill.sources.USER);
                        return false;
                        // quill.deleteText(range.)
                        // console.log
                        // alert("backspace fired")
                        // let blot = quill.getLeaf(range.index)[0];
                        // // alert("enter fired")
                        // console.log(range, context, blot.constructor.blotName)
                        // if(blot.constructor && blot.constructor.blotName === 'mathbox-inline'){
                        //     // alert("hey!")
                        //     window.blot = blot
                        //     blot.format()
                        // }else{
                        //     return true;
                        // }
                    }
                }
            }
        }}
});



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



let tooltip = new MyToolTip(quill);
tooltip.root.classList.add("math-tooltip")

// tooltip.show()
window.tooltip = tooltip


quill.insertText(4, String.raw `\int_0^1 \vec{F}(\vec{r})\cdot d\vec{r}`, {inlinetex: true})


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
        console.log("you exited inline or block tex.", blotOld)
        // debugger;
        let formula = blotOld.text;
        let begin = quill.getIndex(blotOld);
        let count = formula.length;

        let wasInline = blotOld.parent instanceof BlockTex

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
$('#bold-button').click(function() {
    quill.format('bold', true);
});
$('#italic-button').click(function() {
    quill.format('italic', true);
});

$('#link-button').click(function() {
    let value = prompt('Enter link URL');
    quill.format('link', value);
});

$('#blockquote-button').click(function() {
    quill.format('blockquote', true);
});

$('#header-1-button').click(function() {
    quill.format('header', 1);
});

$('#header-2-button').click(function() {
    quill.format('header', 2);
});

$('#divider-button').click(function() {
    // let range = quill.getSelection(true);
    // quill.insertText(range.index, '\n', Quill.sources.USER);
    // quill.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER);
    // quill.setSelection(range.index + 2, Quill.sources.SILENT);
    let range = quill.getSelection(true);
    let latex = String.raw `\int f(x)dx = F(x)+C`;
    // quill.insertText(range.index, '\n', Quill.sources.USER);
    // debugger;
    // quill.insertText(0, "hello", "blockquote", true)
    quill.format("code-block", true)


});



$('#tweet-button').click(function() {
    let range = quill.getSelection(true);
    let latex = String.raw `\int f(x)dx = F(x)+C`;
    // quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.insertText(range.index, String.raw `\vec{F} = m\vec{a}`, {"inlinetex": true})

    // quill.insertEmbed(range.index + 1, 'mathbox-inline', latex, Quill.sources.USER);
    // quill.setSelection(range.index + 2, Quill.sources.SILENT);
});
//
