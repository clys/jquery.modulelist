(function ($) {
    var versions = "1.0",
        pluginName = "jQuery.moduleList",
        pluginMethodsName = "moduleList",
        pluginEleTagName = "moduleList-tag",
        methods = {},
        pool = {
            defaultParam: {
                draggable: '',
                sortable: '',
                empty: false,
                addCallback: function (event, ui) {
                },
                draggableEx: {},
                sortableEx: {},
                clickRoleBefore: {},
                handleHtml: '<div class="handle" role="handle"><span class="up" role="up">↑</span><span class="down" role="down">↓</span><span class="del" role="del">x</span></div>'
            },
            eleMap: {},
            roleForFn: {
                up: upRow,
                down: downRow,
                del: delRow,
                row: activityRow
            }
        },
        currentEleObj = null;
    $.fn[pluginMethodsName] = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("方法 " + method + "不存在于" + pluginName);
        }

    };
    /* private methods ------------------------------------------------------ */
    var utils = {
        pool: {
            buoyUID: 0
        },
        getUID: function () {
            return '' + (new Date()).getMilliseconds() + utils.pool.buoyUID++;
        },
        object: {
            isNull: function (obj) {
                return typeof obj === "undefined" || obj === null;
            },
            isNotNull: function (obj) {
                return !this.isNull(obj);
            }
        },
        string: {
            isEmpty: function (str) {
                return utils.object.isNull(str) || str.length === 0;
            }
        }
    };

    function pushEleObj(ele, param) {
        var $ele = $(ele);
        if (utils.object.isNotNull(pullEleObj($ele))) {
            return false;
        }
        var parameter = $.extend({}, pool.defaultParam, param);
        var uid = utils.getUID();
        $ele.attr(pluginEleTagName, uid);
        var eleObj = {ele: $ele, param: parameter};
        pool.eleMap[uid] = eleObj;
        return eleObj;
    }

    function pullEleObj(ele) {
        var uid = getAttrVal(ele, pluginEleTagName);
        if (utils.string.isEmpty(uid)) {
            return null;
        }
        return pool.eleMap[uid];
    }

    function updateEleObj(eleObj) {
        var uid = getAttrVal(eleObj.ele, pluginEleTagName);
        pool.eleMap[uid] = eleObj;
        return updateEleObj;
    }

    function removeEleObj(eleObj) {
        var uid = getAttrVal(eleObj.ele, pluginEleTagName);
        delete pool.eleMap[uid];
        return removeEleObj;
    }

    function getAttrVal(ele, attrName) {
        var $ele = $(ele);
        return $ele.attr(attrName) || $ele.parents('[' + attrName + ']:first').attr(attrName);
    }

    function init() {
        var $e = currentEleObj.ele, param = currentEleObj.param, $sortable = $(param.sortable);

        $(param.draggable).draggable($.extend(
            {},
            {
                connectToSortable: param.sortable,
                helper: "clone",
                revert: "invalid"
            },
            param.draggableEx
        ));
        $sortable
            .addClass('moduleList-list')
            .sortable($.extend(
                {},
                {
                    helper: function (a, b) {
                        var w = b.innerWidth(), h = b.innerHeight(),
                            $new = $($('<div class="helper" style="width: ' + w + 'px;height: ' + h + 'px">' + b.prop("outerHTML") + '</div>'));
                        return $new;
                    },
                    handle: '[role="handle"]',
                    cancel: '[role="handle"] *',
                    axis: 'y',
                    placeholder: 'placeholder',
                    forcePlaceholderSize: true
                },
                param.sortableEx
            ))
            .on('sortreceive.' + pluginMethodsName, function (event, ui) {
                var $t = $(ui.helper);
                buildHandle($t, event, ui);
            })
            .on('click.' + pluginMethodsName, '[role]', clickRole)
            .on('sortstop', function (event, ui) {
                //玄学护盾
                $sortable.find('.helper.ui-sortable-helper').remove()
            });

        $('body').on('click.' + pluginMethodsName, function (e) {
            if (!$.contains($sortable.get(0), e.target)) {
                inertiaAllRow();
            }
            e.stopPropagation();
        })
    }

    function buildHandle(e, event, ui) {
        var $e = $(e);
        if ($e.find('[role="handle"]').size() > 0) return;
        if (currentEleObj.param.empty && event.type !== 'code.buildHandle') {
            $e.html('');
        }
        $e.prepend(currentEleObj.param.handleHtml).css({
            width: 'initial',
            height: 'initial'
        }).attr('role', 'row').addClass('row');
        currentEleObj.param.addCallback.apply(e, [event, ui]);
    }

    function getRow(e) {
        var $e = $(e);
        if ($e.attr('role') == 'row') {
            return e;
        }
        return $e.parents('[role="row"]:eq(0)')
    }

    function clickRole(eve) {
        var $e = $(this), $row = getRow($e), role = $e.attr('role'), param = currentEleObj.param, carry = true;
        if (param.clickRoleBefore[role]) {
            carry = param.clickRoleBefore[role]($e, $row, currentEleObj);
            carry != false && carry != true && (carry = true)
        }
        carry && pool.roleForFn[role] && pool.roleForFn[role]($e, $row);
    }

    function delRow($e, $row) {
        $row.remove();
    }

    function upRow($e, $row) {
        $row.prev().before($row);
    }

    function downRow($e, $row) {
        $row.next().after($row)
    }

    function activityRow($e, $row) {
        inertiaAllRow($e);
        $row.addClass('activity')
    }

    function inertiaAllRow() {
        $(currentEleObj.param.sortable).find('[role="row"].activity').removeClass('activity');
    }


    /* public methods ------------------------------------------------------- */
    methods = {
        init: function (options) {
            var $ele = $(this);
            $ele.each(function () {
                var $currentEle = $(this),
                    eleObj = pushEleObj($currentEle, options),
                    param;
                if (!eleObj) return true;
                currentEleObj = eleObj;

                init();
            });
            return this;
        },
        buildHandle: function (e) {
            var $ele = typeof e == 'string' ? $(this).find(e) : $(e);
            $ele.each(function () {
                buildHandle(this, {type: 'code.buildHandle'})
            });
            return this;
        },
        ver: function () {
            return versions;
        }
    };
})(jQuery);