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
                handleHtml: '<span class="handle" role="handle"><span class="up" role="up">↑</span><span class="down" role="down">↓</span><span class="del" role="del">x</span></span>'
            },
            eleMap: {},
            roleForFn: {
                up: upRow,
                down: downRow,
                del: delRow,
                row: activityRow
            },
            listClass: 'moduleList-list'
        };
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
    initPlugin();
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

    function pushEleObj(ele, param, mode) {
        var $ele = $(ele);
        if (utils.object.isNotNull(pullEleObj($ele, mode))) {
            return false;
        }
        var parameter = $.extend({}, pool.defaultParam, param);
        var uid = utils.getUID();
        $ele.attr(pluginEleTagName, uid);
        var eleObj = {ele: $ele, param: parameter};
        pool.eleMap[uid] = eleObj;
        return eleObj;
    }

    function pullEleObj(ele, mode) {
        var uid = getAttrVal(ele, pluginEleTagName, mode);
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

    function getAttrVal(ele, attrName, mode) {
        var $ele = $(ele);
        return (mode == '1' ? null : $ele.attr(attrName)) || (mode == '0' ? null : $ele.parents('[' + attrName + ']:first').attr(attrName));
    }

    function initPlugin() {
        var listClassS = '.' + pool.listClass;
        $(document).off('.' + pluginMethodsName)
            .on('sortreceive.' + pluginMethodsName, listClassS, function (event, ui) {
                var $t = $(ui.helper);
                buildHandle($t, event, ui);
                event.stopPropagation();
            })
            .on('click.' + pluginMethodsName, listClassS + ' [role]', function (event) {
                clickRole.apply(this, [event]);
                event.stopPropagation();
            })
            .on('sortstop.' + pluginMethodsName, listClassS, function (event, ui) {
                //玄学护盾
                $(listClassS).find('.ui-sortable-helper').remove();
                event.stopPropagation();
            }).on('click.' + pluginMethodsName, function (event) {
                if (pullEleObj(event.target) == null) {
                    inertiaAllRow();
                }
                event.stopPropagation();
            });
    }

    function init(eleObj) {
        var $e = eleObj.ele,
            param = eleObj.param,
            $sortable = $(param.sortable),
            $draggable = $(param.draggable),
            pid = $e.attr(pluginEleTagName),
            pEleObj = pullEleObj($sortable, 1);

        if (pEleObj != null && pEleObj.param.draggable == param.draggable) {
            pEleObj.param.sortable += ',' + param.sortable;
            $draggable.draggable("option", "connectToSortable", pEleObj.param.sortable);
        } else {
            $draggable
                .draggable($.extend(
                    {},
                    {
                        connectToSortable: param.sortable,
                        helper: "clone",
                        revert: "invalid"
                    },
                    param.draggableEx
                ));
        }


        $sortable
            .attr(pluginEleTagName, pid)
            .addClass(pool.listClass)
            .sortable($.extend(
                {},
                {
                    helper: function (a, b) {
                        var w = b.innerWidth(), h = b.innerHeight(),
                            $new = $($('<div class="moduleList-list helper" style="width: ' + w + 'px;height: ' + h + 'px">' + b.prop("outerHTML") + '</div>'));
                        return $new;
                    },
                    appendTo: document.body,
                    items: '[role="row"]',
                    handle: '[role="handle"]',
                    cancel: '[role="handle"] *',
                    tolerance: 'pointer',
                    axis: 'y',
                    placeholder: 'placeholder',
                    forcePlaceholderSize: true
                },
                param.sortableEx
            ));
    }

    function buildHandle(e, event, ui) {
        var $e = $(e), eleObj = pullEleObj(e);
        if (
            $e.find('[role="handle"]').size() > 0
            || !utils.string.isEmpty($e.attr('role'))
        ) return;
        if (eleObj.param.empty && event.type !== 'code.buildHandle') {
            $e.html('');
        }
        $e.prepend(eleObj.param.handleHtml).css({
            width: 'initial',
            height: 'initial'
        }).attr('role', 'row').addClass('row');
        eleObj.param.addCallback.apply(e, [event, ui]);
    }

    function getRow(e) {
        var $e = $(e);
        if ($e.attr('role') == 'row') {
            return e;
        }
        return $e.parents('[role="row"]:eq(0)')
    }

    function clickRole(eve) {
        var $e = $(this),
            eleObj = pullEleObj($e, '1'),
            $row = getRow($e),
            role = $e.attr('role'),
            param = eleObj.param,
            carry = true;
        if (param.clickRoleBefore[role]) {
            carry = param.clickRoleBefore[role]($e, $row, eleObj);
            carry != false && carry != true && (carry = true)
        }
        carry && pool.roleForFn[role] && pool.roleForFn[role]($e, $row);
    }

    function delRow($e, $row) {
        $row.remove();
    }

    function upRow($e, $row) {
        var $prev = $row.prev();
        if ($prev.attr('role') !== 'handle') {
            $prev.before($row);
        }
    }

    function downRow($e, $row) {
        $row.next().after($row)
    }

    function activityRow($e, $row) {
        inertiaAllRow($row);

        var $p = $row.parents('[role="row"]:eq(0)');
        if ($p.size() > 0) {
            $p.click();
        }


        $row.addClass('activity')
    }

    function inertiaAllRow(e) {
        var $e;
        if (e) {
            $e = $(pullEleObj(e, '1').param.sortable);
        } else {
            $e = $('.' + pool.listClass);
        }
        $e.find('[role="row"].activity').removeClass('activity');
    }


    /* public methods ------------------------------------------------------- */
    methods = {
        init: function (options) {
            var $ele = $(this);
            $ele.each(function () {
                var $currentEle = $(this),
                    eleObj = pushEleObj($currentEle, options, '0'),
                    param;
                if (!eleObj) return true;
                init(eleObj);
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