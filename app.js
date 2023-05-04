// Initialize Quill editor
var quill = new Quill('#editor', {
    placeholder: 'Click the MathJax button to insert a formula.',
    theme: 'snow',
    modules: {
        toolbar:
            [
                ['bold', 'italic', 'underline', 'strike'],
                ['link'],
                ['blockquote'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                ['align', { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }]
            ]
    },
});

window.quill = quill;

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
    quill.insertEmbed(range.index, 'mathjax', latex);
    quill.insertText(range.index + range.length + 1 , ' ');
    quill.setSelection(range.index + range.length + 1);
}

document.getElementById("text").onclick = ()=>{
    /* console.log(quill.root.innerHTML) */
    /* var md = window.markdownit() */;

    var html = quill.root.innerHTML
    /*   var markdown = toMarkdown();
      var rmd = md.render(markdown); */

    console.log(html)
    /*   console.log(markdown)
      console.log(rmd) */
    /* console.log(rendered_markdown) */
}


// Import parchment and delta for creating custom module
const Parchment = Quill.imports.parchment;
const Delta = Quill.imports.delta;
const toMD = Quill.import('delta').toMarkdown;

// Extend the embed
class Mathjax extends Parchment.Embed {

    // Create node
    static create(value)
    {
        const node = super.create(value);
        if (typeof value === 'string') {
            node.innerHTML = "&#65279;" + this.tex2svg(value) + "&#65279;";
            node.contentEditable = 'true'
            node.setAttribute('data-value', value);

            node.addEventListener('click', () => {

                const newValue = prompt('Enter new LaTeX formula:', node.getAttribute('data-value'));
                if (newValue) {
                    node.setAttribute('data-value', newValue);
                    node.innerHTML = "&#65279;" + this.tex2svg(newValue) + "&#65279;";



                }});
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
        MathJax.typeset();
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
Mathjax.tagName = 'SPAN';

// Register the module
Quill.register(Mathjax);
