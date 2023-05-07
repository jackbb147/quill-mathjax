

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
            bindings: enterHandler.getBindings()
        }
    }
});













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
