
// Import parchment and delta for creating custom module
const Parchment = Quill.imports.parchment;
const Delta = Quill.imports.delta;

let Inline = Quill.import('blots/inline');
const Tooltip = Quill.import('ui/tooltip');



// Extend the embed
// class Mathjax extends Parchment.Embed {
class Mathjax extends Inline{

    // Create node
    static create(value)
    {
        const node = super.create(value);
        if (typeof value === 'string') {
            node.innerHTML = "&#65279;" + this.tex2svg(value) + "&#65279;";
            node.contentEditable = 'true'
            node.setAttribute('data-value', value);

            let getClickHandler = ()=>{

                var editing = false;
                let f = ()=>{
                    if(!editing){
                        editing = true
                        node.innerHTML = "you clicked me :("
                    }
                }

                return f;
            }

            // node.addEventListener("keydown",(e)=>{
            //     alert("key down")
            //
            // })
            node.addEventListener('click', getClickHandler()




                // const newValue = prompt('Enter new LaTeX formula:', node.getAttribute('data-value'));
                // if (newValue) {
                //     node.setAttribute('data-value', newValue);
                //     node.innerHTML = "&#65279;" + this.tex2svg(newValue) + "&#65279;";
                //


                // }
                // }
            );
            /* node.addEventListener('click', function() {
              alert('clicked!');
              console.log(node.getAttribute('data-value'))
                    }); */
        }
        return node;
    }

    // Return the attribute value (probably for Delta)
    static value(domNode)
    {
        return domNode.getAttribute('data-value');
    }


    // Manually render a MathJax equation until version 3.0.2 is not released
    static tex2svg(latex)
    {
        // Create a hidden node and render the formula inside
        let MathJaxNode = document.createElement("DIV");
        MathJaxNode.style.visibility = "hidden";
        MathJaxNode.innerHTML = '\\(' + latex + '\\)';
        document.body.appendChild(MathJaxNode);
        // MathJax.typeset();
        let svg = MathJaxNode.innerHTML;
        document.body.removeChild(MathJaxNode);
        return svg;
    }
    /*
    //	Never called ? See : https://stackoverflow.com/questions/60935100/html-method-in-quill-formula-js
    html() {
        const { mathjax } = this.value();
        return `<span>${mathjax}</span>`;
      }
     */
}

// Set module properties
Mathjax.blotName = 'mathjax';
Mathjax.className = 'ql-mathjax';
Mathjax.tagName = 'CODE';

// Register the module
Quill.register(Mathjax);


class MyToolTip extends Tooltip{
    constructor(quill, bounds) {
        super(quill, bounds);
    }
}


// This is the innerHTML of the tooltip.
// https://stackoverflow.com/questions/41131547/building-custom-quill-editor-theme
MyToolTip.TEMPLATE = `
<!--<span>hello</span>-->
<span>I wrote this template myself: ${MathJax.tex2svg('\\int').outerHTML}</span>
`

var CODES = []
for(var i = 0; i < 222; i++)
    CODES.push(i);
// Initialize Quill editor
var quill = new Quill('#editor', {
    placeholder: 'Click the MathJax button to insert a formula.',
    theme: 'bubble',
    modules: {
        toolbar:
            [
                ['bold', 'italic', 'underline', 'strike'],
                ['link'],
                ['blockquote'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['align', { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }]
            ],

        keyboard: {
            // bindings: {
            //     formula: {
            //         // key: 'backspace',
            //         key: ()=>true,
            //         format: ["mathjax"],
            //         handler: function(range, context){
            //             // alert("backspace fired")
            //             console.log("backspace fired in formula", range, context)
            //
            //         }
            //     }
            // }
        }
    },
});


// var mFormat = quill.getFormat('mathjax')
// mFormat.on('text-change', (delta, oldDelta, source)=>{
//     console.log(delta, oldDelta, source)
// })
let myTooltip = new MyToolTip(quill);
window.tooltip = myTooltip

myTooltip.show()
window.quill = quill;

quill.on("text-change", (delta, oldDelta, source)=>{
    console.log(delta, oldDelta, source)
    // The current blot that the user is typing in
    let blot = quill.getLeaf(quill.getSelection().index)[0] //https://quilljs.com/docs/api/#events

    let text = blot.text;

    // This is literally a html element <mjx-container>...</mjx-container>
    let formulaHTMLElement = MathJax.tex2svg(text);

    myTooltip.root.innerHTML = formulaHTMLElement.outerHTML;





    console.log("blot: ", blot,text, formulaHTMLElement)
})

// Display the current delta content of the editor in the console
document.getElementById('delta').onclick = () => {
    console.log ( quill.getContents().ops );

}

document.getElementById('disable').onclick = (() => {

    var enable = false;
    return ()=>{
        quill.enable(enable)
        enable = !enable;
    }
})()

// When the MathJax button is clicked, add a mathjax equation at the current selection
document.getElementById('mathjax').onclick = () => {
    var latex = prompt("Enter a LaTeX formula:", "e=mc^2");
    var range = quill.getSelection(true);
    quill.deleteText(range.index, range.length);

    quill.insertText(range.index, latex, {mathjax: true})



    quill.insertText(range.index + range.length + 1 , ' ');
    quill.setSelection(range.index + range.length + 1);
}

document.getElementById("text").onclick = ()=>{
    /* console.log(quill.root.innerHTML) */
    /* var md = window.markdownit() */

    var html = quill.root.innerHTML
    /*   var markdown = toMarkdown();
      var rmd = md.render(markdown); */

    console.log(html)
    /*   console.log(markdown)
      console.log(rmd) */
    /* console.log(rendered_markdown) */
}

