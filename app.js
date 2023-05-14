Quill.register(Block)
Quill.register(BlockMathDisplay)
Quill.register(BlockTexEditor)
Quill.register(InlineTexEditor)
Quill.register(BlockWrapper)
Quill.register(InlineMathDisplay);
Quill.register('modules/MathEditorModule', MathEditorModule)


let quill = new Quill('#editor-container', {
    theme: "bubble",
    modules:{
        MathEditorModule: {

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
