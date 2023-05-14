

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


class BlockquoteBlot extends Block { }
BlockquoteBlot.blotName = 'blockquote';
BlockquoteBlot.tagName = 'blockquote';

window.BlockquoteBlot = BlockquoteBlot



Quill.register(Block)

Quill.register(BlockMathDisplay)
Quill.register(BlockTexEditor)
Quill.register(InlineTexEditor)
Quill.register(BlockWrapper)

Quill.register(BoldBlot);
Quill.register(ItalicBlot);
Quill.register(LinkBlot);
Quill.register(BlockquoteBlot);
Quill.register(HeaderBlot);
Quill.register(DividerBlot);
Quill.register(InlineMathDisplay);

Quill.register('modules/MathEditorModule', MathEditorModule)

let enterHandler = new EnterHandlerClass();

let quill = new Quill('#editor-container', {
    theme: "bubble",
    modules:{
        MathEditorModule: {
            enterHandler
        },
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block']
        ],
        keyboard:
            {
            // bindings: enterHandler.getBindings()
                bindings: MathEditorModule.getBindings()
        }
    }
});

function setFontSize(){
    document.getElementById("editor-container").style.fontSize = EDITOR_CONTAINER_FONTSIZE
}

setFontSize()




/**
 * For inline math edit
 */
$('#tweet-button').click(function() {
    let range = quill.getSelection(true);
    let latex = String.raw `\int f(x)dx = F(x)+C`;

    // let defaultText = String.raw `\vec{F} = m\vec{a}` // use this for debugging..
    // quill.insertText(range.index, ' ', {"inlinetex": true})

    let defaultText=  " "
     
    MathEditorModule.insertInlineTexEditor(range.index, defaultText)
    // quill.insertEmbed(range.index + 1, INLINE_TEX_EDITOR_CLASSNAME, true, Quill.sources.USER);
    // quill.setSelection(range.index + 1, Quill.sources.SILENT);

});


/**
 * For block math edit
 */
$('#divider-button').click(function() {
    // quill.setSelection(range.index + 2, Quill.sources.SILENT);
    let range = quill.getSelection(true);
    let latex = String.raw `\int f(x)dx = F(x)+C`;

    //  ;
    // TODO
    let blockTexEditorClassName = "blocktexeditor"
    // quill.format("blockwrapper", true) //todo
    quill.insertEmbed(range.index + 1, blockTexEditorClassName, true, Quill.sources.USER);
    // quill.setSelection(range.index + 1, Quill.sources.SILENT);


    // TODO refactor this somewhere else!
    let node = document.getElementsByClassName(blockTexEditorClassName)[0]
    //
    // console.assert(window.configureACEEditor)
    window.configureACEEditor(node, latex)

});


window.f = ()=>{
    quill.format("blockwrapper", true)
}

//
