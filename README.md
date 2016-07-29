可以拖动添加模块的列表
依赖 jquery、jqueryui
初始化:
```
$('#啊？').moduleList(
    {
        draggable: '',//模块选择器
        sortable: '',//列表选择器
        focusOutRange: '',//触发失焦的区域
        empty: false,//添加模块到列表时初始化为空白
        addCallback: function (event, ui) {//添加模块后的回调
        },
        draggableEx: {},//模块初始化时的参数(jqueryui的draggable)
        sortableEx: {},//列表初始化时的参数(jqueryui的sortable)
        clickRoleBefore: {},//执行role对应功能前的回调，返回flase阻止功能执行 可以自定义role 预设的role有 handle:拖拽块 top:置顶 up:上移 down:下移 del:删除
        elementTpl: function(e, event, ui){return e;},//构建元素
        handleHtml: ''//拖动块的代码
    }
```

将子元素变为可拖动:
```
$('#啊？').moduleList('buildHandle', '>div');
```

