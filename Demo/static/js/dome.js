$(function () {
    var n = 0;
    var p = {
        draggable: '#draggable > div',
        focusOutRange: '#啊♂',
        empty: true,
        addCallback: function (event, ui) {
            var $e = $(this);
            if (event.type !== 'code.buildHandle') {
                $e.append('<span>喵' + n++ + '</span><br><span>data-code:' + $e.attr('data-code') + '</span>')
            }
        },
        clickRoleBefore: {
            del: function ($e, $row, eleObj,presetFn) {
                return confirm("真的要删掉" + $row.text() + "吗？")
            }
        },
        draggableEx: {},
        sortableEx: {}
    };
    p.sortable = '#啊？';
    $('#啊？').moduleList(p).moduleList('buildHandle', '>div');
    p.sortable = '.ccc';
    $('.ccc').moduleList(p).moduleList('buildHandle', '>div');

    $('body').disableSelection();
});

