

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
Quill.register(BlockTexEditor)
Quill.register(InlineTexEditor)
Quill.register(BlockWrapper)

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

    let defaultText = String.raw `\vec{F} = m\vec{a}` // use this for debugging..
    // quill.insertText(range.index, ' ', {"inlinetex": true})
    insertInlineTexEditor(range.index, defaultText)
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
    quill.setSelection(range.index + 1, Quill.sources.SILENT);


    // TODO refactor this somewhere else!
    let node = document.getElementsByClassName(blockTexEditorClassName)[0]

    console.assert(window.configureACEEditor)
    window.configureACEEditor(node, latex)
    // var editor = ace.edit(node);
    // var langTools = ace.require("ace/ext/language_tools");
    //
    // editor.setTheme("ace/theme/monokai");
    // editor.session.setMode("ace/mode/latex");
    // editor.setOptions({
    //     enableBasicAutocompletion: true,
    //     enableSnippets: true,
    //     enableLiveAutocompletion: true,
    //     maxLines: 40 //TODO change this as needed https://stackoverflow.com/questions/11584061/automatically-adjust-height-to-contents-in-ace-cloud-9-editor
    // });
    // // editor.setAutoScrollEditorIntoView(true);
    //
    // window.editor = editor;
    //
    // editor.commands.addCommand({
    //     name: 'myCommand',
    //     // bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
    //     bindKey: {win: 'Ctrl-enter',  mac: 'Command-enter'},
    //     exec: EnterHandlerClass.getConvertEditorToMathHandler(enterHandler), //TODO refactor this to make sure this quill instance is the right one... especially when there is more than one quill editor in the page ...
    //     readOnly: true, // false if this command should not apply in readOnly mode
    //     // multiSelectAction: "forEach", optional way to control behavior with multiple cursors
    //     // scrollIntoView: "cursor", control how cursor is scolled into view after the command
    // });
});


window.f = ()=>{
    quill.format("blockwrapper", true)
}

//
