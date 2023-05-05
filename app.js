let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
let InlineEmbed = Quill.import('blots/embed')

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

class BlockquoteBlot extends Block { }
BlockquoteBlot.blotName = 'blockquote';
BlockquoteBlot.tagName = 'blockquote';

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

class TweetBlot extends InlineEmbed {
    static create(latex) {
        let node = super.create();

        node.style.display = "inline"
        node.style.border = "1px solid red"


        node.setAttribute('latex', latex);
        // var mjx = MathJax.tex2svg(latex);
        var mjx = MathJax.tex2mml(latex);
        // node.appendChild(mjx)
        node.innerHTML = mjx;

        //
        let mathNode = node.firstChild;
        mathNode.removeAttribute("display")
        mathNode.style["math-style"] = "normal"
        window.node = node;
        return node;
    }

    static value(domNode) {
        return domNode.dataset.id;
    }
}
TweetBlot.blotName = 'mathbox-inline';
TweetBlot.tagName = 'div';
TweetBlot.className = 'mathbox-inline';

Quill.register(BoldBlot);
Quill.register(ItalicBlot);
Quill.register(LinkBlot);
Quill.register(BlockquoteBlot);
Quill.register(HeaderBlot);
Quill.register(DividerBlot);
Quill.register(TweetBlot);


let quill = new Quill('#editor-container');

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
    let range = quill.getSelection(true);
    quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER);
    quill.setSelection(range.index + 2, Quill.sources.SILENT);
});



$('#tweet-button').click(function() {
    let range = quill.getSelection(true);
    let latex = String.raw `\int f(x)dx = F(x)+C`;
    // quill.insertText(range.index, '\n', Quill.sources.USER);
    quill.insertEmbed(range.index + 1, 'mathbox-inline', latex, Quill.sources.USER);
    quill.setSelection(range.index + 2, Quill.sources.SILENT);
});
//
// // Import parchment and delta for creating custom module
// const Parchment = Quill.imports.parchment;
// const Delta = Quill.imports.delta;
//
// let Inline = Quill.import('blots/inline');
// const Tooltip = Quill.import('ui/tooltip');
//
// // Extend the embed
// class Formula  extends Parchment.Embed {
//
//     // Create node
//     static create(value)
//     {
//         const node = super.create(value);
//         if (typeof value === 'string') {
//             node.innerHTML = "&#65279;" + this.tex2svg(value) + "&#65279;";
//             node.contentEditable = 'true'
//             node.setAttribute('data-value', value);
//
//             // node.addEventListener('keydown',(e)=>{
//             //     e.stopPropagation()
//             //     e.preventDefault()
//             //     console.log("key down")
//             // })
//
//             // node.addEventListener('click',
//             //     (() => {
//             //
//             //             var isEditing = false
//             //
//             //             return ()=>{
//             //                 if(!isEditing){
//             //                     isEditing = true;
//             //                     // let codeEditArea = document.createElement('code')
//             //                     node.innerHTML = String.raw`<code> </code>`
//             //
//             //                     let codeBox = node.childNodes[0]
//             //
//             //                     window.codeBox = codeBox;
//             //                     console.log(codeBox)
//             //                     codeBox.addEventListener('keydown', (e)=>{
//             //                         // e.preventDefault()
//             //                         console.log("keydown!",e)
//             //                         // console.log(e)
//             //
//             //                     })
//             //                     // node.innerHTML = codeEditArea.outerHTML
//             //                     // codeEditArea.focus()
//             //                     // node.replaceChildren(codeEditArea)
//             //                 }else{
//             //                     console.log(node, node.childNodes)
//             //                 }
//             //
//             //                 // const newValue = prompt('Enter new LaTeX formula:', node.getAttribute('data-value'));
//             //                 // if (newValue) {
//             //                 //     node.setAttribute('data-value', newValue);
//             //                 //     node.innerHTML = "&#65279;" + this.tex2svg(newValue) + "&#65279;";
//             //                 //
//             //                 //
//             //                 //
//             //                 // }});
//             //                 /* node.addEventListener('click', function() {
//             //                   alert('clicked!');
//             //                   console.log(node.getAttribute('data-value'))
//             //                         }); */
//             //             }
//             //         }
//             //     )()
//             // )
//         return node;
//     }}
//
//     // Return the attribute value (probably for Delta)
//     static value(domNode)
//     {
//         return domNode.getAttribute('data-value');
//     }
//
//
//     // Manually render a MathJax equation until version 3.0.2 is not released
//     static tex2svg(latex)
//     {
//         // Create a hidden node and render the formula inside
//         let MathJaxNode = document.createElement("DIV");
//         MathJaxNode.style.visibility = "hidden";
//         MathJaxNode.innerHTML = '\\(' + latex + '\\)';
//         document.body.appendChild(MathJaxNode);
//         MathJax.typeset();
//         let svg = MathJaxNode.innerHTML;
//         document.body.removeChild(MathJaxNode);
//         return svg;
//     }
//     /*
//     //	Never called ? See : https://stackoverflow.com/questions/60935100/html-method-in-quill-formula-js
//     html() {
//         const { mathjax } = this.value();
//         return `<span>${mathjax}</span>`;
//       }
//      */
// }
//
//
// // Set module properties
// Formula.blotName = 'formula';
// Formula.className = 'ql-formula';
// Formula.tagName = 'pre'
// // Formula.tagName = 'SPAN';
//
// // Register the module
// Quill.register(Formula);
//
//
//
// // Extend the embed
// // class Mathjax extends Parchment.Embed {
// class Mathjax extends Inline{
//
//     // Create node
//     // static create(value)
//     // {
//     //     const node = super.create(value);
//     //     if (typeof value === 'string') {
//     //         alert("fired")
//     //         node.innerHTML = "&#65279;" + this.tex2svg(value) + "&#65279;";
//     //         node.contentEditable = 'true'
//     //         node.setAttribute('data-value', value);
//     //
//     //         let getClickHandler = ()=>{
//     //
//     //             var editing = false;
//     //             let f = ()=>{
//     //                 if(!editing){
//     //                     editing = true
//     //                     node.innerHTML = "you clicked me :("
//     //                 }
//     //             }
//     //
//     //             return f;
//     //         }
//     //
//     //         // node.addEventListener("keydown",(e)=>{
//     //         //     alert("key down")
//     //         //
//     //         // })
//     //         // node.addEventListener('click', getClickHandler())
//     //         node.addEventListener("click",()=>{
//     //             alert("you clicked me")
//     //         })
//     //         window.node = node;
//     //
//     //
//     //
//     //             // const newValue = prompt('Enter new LaTeX formula:', node.getAttribute('data-value'));
//     //             // if (newValue) {
//     //             //     node.setAttribute('data-value', newValue);
//     //             //     node.innerHTML = "&#65279;" + this.tex2svg(newValue) + "&#65279;";
//     //             //
//     //
//     //
//     //             // }
//     //             // }
//     //         // );
//     //         /* node.addEventListener('click', function() {
//     //           alert('clicked!');
//     //           console.log(node.getAttribute('data-value'))
//     //                 }); */
//     //     }
//     //     return node;
//     // }
//
//     // Return the attribute value (probably for Delta)
//     static value(domNode)
//     {
//         return domNode.getAttribute('data-value');
//     }
//
//
//     // Manually render a MathJax equation until version 3.0.2 is not released
//     static tex2svg(latex)
//     {
//         // Create a hidden node and render the formula inside
//         let MathJaxNode = document.createElement("DIV");
//         MathJaxNode.style.visibility = "hidden";
//         MathJaxNode.innerHTML = '\\(' + latex + '\\)';
//         document.body.appendChild(MathJaxNode);
//         // MathJax.typeset();
//         let svg = MathJaxNode.innerHTML;
//         document.body.removeChild(MathJaxNode);
//         return svg;
//     }
//     /*
//     //	Never called ? See : https://stackoverflow.com/questions/60935100/html-method-in-quill-formula-js
//     html() {
//         const { mathjax } = this.value();
//         return `<span>${mathjax}</span>`;
//       }
//      */
// }
//
// // Set module properties
// Mathjax.blotName = 'mathjax';
// Mathjax.className = 'ql-mathjax';
// Mathjax.tagName = 'CODE';
//
// // Register the module
// Quill.register(Mathjax);
//
//
// class MyToolTip extends Tooltip{
//     constructor(quill, bounds) {
//         super(quill, bounds);
//     }
// }
//
//
// // This is the innerHTML of the tooltip.
// // https://stackoverflow.com/questions/41131547/building-custom-quill-editor-theme
// MyToolTip.TEMPLATE = `
// <!--<span>hello</span>-->
// <span>I wrote this template myself: ${MathJax.tex2svg('\\int').outerHTML}</span>
// `
//
// var CODES = []
// for(var i = 0; i < 222; i++)
//     CODES.push(i);
// // Initialize Quill editor
// var quill = new Quill('#editor', {
//     placeholder: 'Click the MathJax button to insert a formula.',
//     theme: 'bubble',
//     modules: {
//         toolbar:
//             [
//                 ['bold', 'italic', 'underline', 'strike'],
//                 ['link'],
//                 ['blockquote'],
//                 [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//                 [{ 'script': 'sub'}, { 'script': 'super' }],
//                 ['align', { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }]
//             ],
//
//         keyboard: {
//             bindings: {
//                 formula: {
//                     key: 'backspace',
//                     // format: ["mathjax"],
//                     handler: function(range, context){
//                         // console.log
//                         // alert("backspace fired")
//
//                         let blot = quill.getLeaf(quill.getSelection().index)[0]
//                         let name = blot.domNode.className
//                         window.blot =blot;
//                         console.log("backspace fired", range, context, blot)
//                         // if(name === 'ql-formula') return false
//                         return true
//
//                     }
//                 }
//             }
//         }
//     },
// });
//
//
// // var mFormat = quill.getFormat('mathjax')
// // mFormat.on('text-change', (delta, oldDelta, source)=>{
// //     console.log(delta, oldDelta, source)
// // })
// let myTooltip = new MyToolTip(quill);
// window.tooltip = myTooltip
//
// myTooltip.show()
// window.quill = quill;
//
// quill.on("text-change", (delta, oldDelta, source)=>{
//     console.log(delta, oldDelta, source)
//
//     // The current blot that the user is typing in
//     let blot = quill.getLeaf(quill.getSelection().index)[0] //https://quilljs.com/docs/api/#events
//
//     let text = blot.text;
//
//     // This is literally a html element <mjx-container>...</mjx-container>
//     let formulaHTMLElement = MathJax.tex2svg(text);
//
//     window.formula = formulaHTMLElement
//
//     // put the formula in the tooltip.
//     myTooltip.root.innerHTML = formulaHTMLElement.outerHTML;
//
//     console.log("blot: ", blot,text, formulaHTMLElement)
// })
//
// quill.on("click",()=>{
//     alert("clicked")
// })
//
// // Display the current delta content of the editor in the console
// document.getElementById('delta').onclick = () => {
//     console.log ( quill.getContents().ops );
//
// }
//
// document.getElementById('disable').onclick = (() => {
//
//     var enable = false;
//     return ()=>{
//         quill.enable(enable)
//         enable = !enable;
//     }
// })()
//
// // When the MathJax button is clicked, add a mathjax equation at the current selection
// document.getElementById('mathjax').onclick = () => {
//     var latex = prompt("Enter a LaTeX formula:", "e=mc^2");
//     var range = quill.getSelection(true);
//     quill.deleteText(range.index, range.length);
//
//     quill.insertText(range.index, latex, {mathjax: true})
//
//
//
//     quill.insertText(range.index + range.length + 1 , ' ');
//     quill.setSelection(range.index + range.length + 1);
// }
//
// document.getElementById("text").onclick = ()=>{
//     /* console.log(quill.root.innerHTML) */
//     /* var md = window.markdownit() */
//
//     var html = quill.root.innerHTML
//     /*   var markdown = toMarkdown();
//       var rmd = md.render(markdown); */
//
//     console.log(html)
//     /*   console.log(markdown)
//       console.log(rmd) */
//     /* console.log(rendered_markdown) */
// }
//
//
//
// quill.insertEmbed(1, 'formula', String.raw `\vec{F} = m\vec{a}`);
