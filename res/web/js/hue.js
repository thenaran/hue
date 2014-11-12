var colorConverter;
(function (colorConverter) {
    function xyBriToRgb(xyb) {
        if(0 > xyb.x || xyb.x > 0.8) {
            console.log('x property must be between 0 and .8, but is: ' + xyb.x);
            xyb.x = Math.max(Math.min(xyb.x, 0.8), 0);
        }
        if(0 > xyb.y || xyb.y > 1) {
            console.log('y property must be between 0 and 1, but is: ' + xyb.y);
            xyb.y = Math.max(Math.min(xyb.y, 1), 0);
        }
        if(0 > xyb.bri || xyb.bri > 1) {
            console.log('bri property must be between 0 and 1, but is: ' + xyb.bri);
            xyb.bri = Math.max(Math.min(xyb.bri, 1), 0);
        }
        var x = xyb.x;
        var y = xyb.y;
        var z = 1.0 - x - y;
        var Y = xyb.bri;
        var X = (Y / y) * x;
        var Z = (Y / y) * z;
        var r = X * 1.612 - Y * 0.203 - Z * 0.302;
        var g = -X * 0.509 + Y * 1.412 + Z * 0.066;
        var b = X * 0.026 - Y * 0.072 + Z * 0.962;
        r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
        g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
        b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
        var cap = function (x) {
            return Math.max(0, Math.min(1, x));
        };
        return {
            r: cap(r),
            g: cap(g),
            b: cap(b)
        };
    }
    colorConverter.xyBriToRgb = xyBriToRgb;
    function rgbToXyBri(rgb) {
        if(0 > rgb.r || rgb.r > 1 || 0 > rgb.g || rgb.g > 1 || 0 > rgb.b || rgb.b > 1) {
            console.log("r, g, and, b properties must be between 0 and 1");
            rgb.r = Math.max(Math.min(rgb.r, 1), 0);
            rgb.g = Math.max(Math.min(rgb.g, 1), 0);
            rgb.b = Math.max(Math.min(rgb.b, 1), 0);
        }
        var red = rgb.r;
        var green = rgb.g;
        var blue = rgb.b;
        var r = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
        var g = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
        var b = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);
        var X = r * 0.649926 + g * 0.103455 + b * 0.197109;
        var Y = r * 0.234327 + g * 0.743075 + b * 0.022598;
        var Z = r * 0.0000000 + g * 0.053077 + b * 1.035763;
        var cx = X / (X + Y + Z);
        var cy = Y / (X + Y + Z);
        if(isNaN(cx)) {
            cx = 0.0;
        }
        if(isNaN(cy)) {
            cy = 0.0;
        }
        return {
            x: cx,
            y: cy,
            bri: Y
        };
    }
    colorConverter.rgbToXyBri = rgbToXyBri;
    function rgbToHexString(rgb) {
        function f(x) {
            x = Math.round(x * 255);
            var s = '0' + x.toString(16);
            return s.substr(-2);
        }
        return f(rgb.r) + f(rgb.g) + f(rgb.b);
    }
    colorConverter.rgbToHexString = rgbToHexString;
    function hexStringToRgb(s) {
        return {
            r: parseInt(s.substring(0, 2), 16) / 255,
            g: parseInt(s.substring(2, 4), 16) / 255,
            b: parseInt(s.substring(4, 6), 16) / 255
        };
    }
    colorConverter.hexStringToRgb = hexStringToRgb;
    function hexStringToXyBri(s) {
        return rgbToXyBri(hexStringToRgb(s));
    }
    colorConverter.hexStringToXyBri = hexStringToXyBri;
    var hueBulbs = [
        'LCT001'
    ];
    var livingColors = [
        'LLC006',
        'LLC007',

    ];
    function triangleForModel(model) {
        if(hueBulbs.indexOf(model) > -1) {
            return {
                r: {
                    x: .675,
                    y: .322
                },
                g: {
                    x: .4091,
                    y: .518
                },
                b: {
                    x: .167,
                    y: .04
                }
            };
        } else if(livingColors.indexOf(model) > -1) {
            return {
                r: {
                    x: .704,
                    y: .296
                },
                g: {
                    x: .2151,
                    y: .7106
                },
                b: {
                    x: .138,
                    y: .08
                }
            };
        } else {
            return {
                r: {
                    x: 1,
                    y: 0
                },
                g: {
                    x: 0,
                    y: 1
                },
                b: {
                    x: 0,
                    y: 0
                }
            };
        }
    }
    function crossProduct(p1, p2) {
        return (p1.x * p2.y - p1.y * p2.x);
    }
    function isPointInTriangle(p, triangle) {
        var red = triangle.r;
        var green = triangle.g;
        var blue = triangle.b;
        var v1 = {
            x: green.x - red.x,
            y: green.y - red.y
        };
        var v2 = {
            x: blue.x - red.x,
            y: blue.y - red.y
        };
        var q = {
            x: p.x - red.x,
            y: p.y - red.y
        };
        var s = crossProduct(q, v2) / crossProduct(v1, v2);
        var t = crossProduct(v1, q) / crossProduct(v1, v2);
        return (s >= 0.0) && (t >= 0.0) && (s + t <= 1.0);
    }
    function closestPointOnLine(a, b, p) {
        var ap = {
            x: p.x - a.x,
            y: p.y - a.y
        };
        var ab = {
            x: b.x - a.x,
            y: b.y - a.y
        };
        var ab2 = ab.x * ab.x + ab.y * ab.y;
        var ap_ab = ap.x * ab.x + ap.y * ab.y;
        var t = ap_ab / ab2;
        t = Math.min(1, Math.max(0, t));
        return {
            x: a.x + ab.x * t,
            y: a.y + ab.y * t
        };
    }
    function distance(p1, p2) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        return dist;
    }
    function xyForModel(xy, model) {
        var triangle = triangleForModel(model);
        if(isPointInTriangle(xy, triangle)) {
            return xy;
        }
        var pAB = closestPointOnLine(triangle.r, triangle.g, xy);
        var pAC = closestPointOnLine(triangle.b, triangle.r, xy);
        var pBC = closestPointOnLine(triangle.g, triangle.b, xy);
        var dAB = distance(xy, pAB);
        var dAC = distance(xy, pAC);
        var dBC = distance(xy, pBC);
        var lowest = dAB;
        var closestPoint = pAB;
        if(dAC < lowest) {
            lowest = dAC;
            closestPoint = pAC;
        }
        if(dBC < lowest) {
            lowest = dBC;
            closestPoint = pBC;
        }
        return closestPoint;
    }
    colorConverter.xyForModel = xyForModel;
    function xyBriForModel(xyb, model) {
        var xy = xyForModel(xyb, model);
        return {
            x: xy.x,
            y: xy.y,
            bri: xyb.bri
        };
    }
    colorConverter.xyBriForModel = xyBriForModel;
})(colorConverter || (colorConverter = {}));

var DETECT_BRIDGE_MAX_TIME = 60000 * 1; // 1 min
var DETECT_BRIDGE_INTERVAL = 1000 * 5; // 5 sec

var bodyContainer;
var helpPage = null;
var detectBridgeStartedTime;
var detectIds = [];

$(window).ready(function(){
    bodyContainer = $('body');

    var colorToHex = function(rgb) {
        var red = Math.round(rgb.r * 255);
        var green = Math.round(rgb.g * 255);
        var blue = Math.round(rgb.b * 255);
        var hexColor = ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).substr(1);
        return '#' + hexColor;
    };
    $.minicolors.defaults.changeDelay = 500;

    var lights_by_id = {};
    var modelHueBulb = 'LCT001';
    var api = new $.ApiWeb('apis');
    api.on('ready', function(a) {
        console.log("api started.");
        console.log(api);

        // try auto detection with help page.
        helpPage = _buildNotConnected();
        bodyContainer.prepend(helpPage);
        // for animation.
        setTimeout(function() {
            helpPage.addClass('active');
        }, 1);
        detectBridgeStartedTime = new Date().getTime();
        tryAutoDetectBridge();

        function _buildNotConnected() {
            var notConnectedContainer = $('<div/>', {
                class: 'not-connected-container'
            });

            var background = $('<div/>', {
                class: 'background-vignette'
            });

            var helpContainer = $('<div/>', {
                class: 'help-container center'
            });

            var contentContainer = $('<div/>', {
                class: 'item-hue-image',
                html: '<img src=\"./imgs/item-hue.png\" alt=\"Philips Hue\" />'
            });
            var titleLabel = $('<div/>', {
                class: 'title-label',
                html: 'Hint1.'
            });
            var descLabel = $('<div/>', {
                class: 'desc-label',
                html: '먼저 브릿지의 <strong>Push-Link 버튼</strong>을 누르세요.'
            });

            var buttonContainer = $('<div/>', {
                class: 'connect-again-container'
            });
            var connectAgainButton = $('<button/>', {
                class: 'connect-again-button',
                html: '재연결 시도'
            }).hide();

            connectAgainButton.click(function() {
                if (!$(this).hasClass('disabled')) {
                    $(this).addClass('disabled');
                    getBridge();
                } else {
                    console.log('reguested get brirdge. dont call this button[' + $(this) + '].');
                }
            });
            buttonContainer.append(connectAgainButton);
            helpContainer.append(contentContainer, titleLabel, descLabel, buttonContainer);

            background.append(helpContainer);
            notConnectedContainer.append(background);

            return notConnectedContainer;
        }

        function tryAutoDetectBridge() {
            console.debug('try detect bridge.');
            clearDetctectIds();
            detectIds.push(setInterval(getBridge, DETECT_BRIDGE_INTERVAL));

            // fire func.
            getBridge();
        }

        function stopDetectBridge() {
            clearDetctectIds();

            var button = $('.connect-again-button');
            button.removeClass('disabled');
            button.show();
        }

        function clearDetctectIds() {
            $.each(detectIds, function(index, id) {
                try {
                    clearInterval(id);
                } catch (e) {
                }
            });
            detectIds = [];
        }

        function getBridge() {
            console.debug('Try gets the bride info.');
            $('#bridge_info').empty();
            $('#lights_panel').empty();

            api.get_bridge()(function(bridge) {
                console.debug('Gets the bridget info.', bridge);
                if (typeof bridge === 'undefined' || !bridge) {
                    $('.connect-again-button').removeClass('disabled');

                    if (new Date().getTime() - detectBridgeStartedTime >= DETECT_BRIDGE_MAX_TIME) {
                        stopDetectBridge();
                    } else {
                        tryAutoDetectBridge();
                    }

                    return;
                }

                clearDetctectIds();
                if (helpPage !== null) {
                    helpPage.remove();
                }

                var titleContainer = $('<div/>', {
                    class: 'title center',
                    html: '<strong>' + bridge.name + '</strong> ('+ bridge.ip +')</div>'
                });
                $('#bridge_info').append(titleContainer);

                api.get_lights()(function(lights) {
                    var elems = [];

                    $.each(lights, function(index, light) {
                        lights_by_id[light.ident] = light;
                        console.log("name: " + light.name);
                        var color = colorToHex(colorConverter.xyBriToRgb({
                            x: light.x,
                            y: light.y,
                            bri: light.brightness / 254
                        }));
                        console.log("color: " + color);

                        var elem_str =  '<div class="box nt-slide-in-bottom">' +
                                            '<input class="light light-dial-input" value="' + light.brightness + '">' +
                                            '<input class="color" type="hidden" id="hidden-input" value="' + color + '">' +
                                            '<div class="name">' + light.name + '</div>' +
                                            '<div class="buttons">' +
                                                '<div class="edit">Edit</div>' +
                                                '<div class="onoff">' +
                                                    '<div class="on">On</div>' +
                                                    '<div class="slash">/</div>' +
                                                    '<div class="off">Off</div>' +
                                                '</div>' +
                                                '<div class="blink">Blink</div>' +
                                            '</div>' +
                                        '</div>';

                        var buttonOn = $('<div/>', {
                            class: 'on',
                            text: 'On'
                        });
                        var buttonOff = $('<div/>', {
                            class: 'off',
                            text: 'Off'
                        });

                        var elem = $(elem_str).appendTo('#lights_panel');
                        var light_elem = elem.children('.light');
                        var color_elem = elem.children('.color');

                        // update state
                        _lightStatusChanger(elem, light.on);

                        // init events
                        elem.find('.onoff').click(function() {
                            api.turn_light(light.ident, !light.on)(function() {
                                console.log('requested turn light[' + light.name + ']: ', !light.on);
                                light.on = !light.on;
                                _lightStatusChanger(elem, light.on);
                            });
                        });
                        elem.find('.blink').click(function() {
                            api.alarm_light(light.ident)(function() {
                                console.log('requested light[' + light.name + '] blink.');
                            });
                        });
                        elem.find('.edit').click(function() {
                            _displayLightRename(elem, light.ident, light.name);
                            console.log('requested rename target: ', light.ident);
                        });

                        light_elem.knob({
                            'min': 0,
                            'max': 254,
                            'angleOffset': -125,
                            'angleArc': 250,
                            'inputColor': 'rgba(0, 0, 0, .5)',
                            'change': function(v) {
                                var c = colorToHex(colorConverter.xyBriToRgb({
                                    x: lights_by_id[light.ident].x,
                                    y: lights_by_id[light.ident].y,
                                    bri: v / 254
                                }));
                                light_elem.trigger('configure', {'fgColor': c});
                                color_elem.minicolors('value', c);
                                var rgb = color_elem.minicolors('rgbObject');
                                light_elem.css('background-color', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + '0.5');
                            },
                            'release': function(v) {
                                api.set_brightness(light.ident, v);
                                light_elem.css('background-color', 'rgba(255, 255, 255, 0)');
                            },
                            'fgColor': color
                        });

                        color_elem.minicolors({
                            change: function(hex, opacity) {
                                var rgb = color_elem.minicolors('rgbObject');
                                var c = colorConverter.rgbToXyBri({
                                    r: rgb.r / 255,
                                    g: rgb.g / 255,
                                    b: rgb.b / 255
                                });

                                c.bri = parseInt(c.bri* 254);

                                // updates the ui.
                                light_elem.val(parseInt(c.bri)).trigger('configure', {'fgColor': hex});

                                // Updates the new clolor.
                                lights_by_id[light.ident].x = c.x;
                                lights_by_id[light.ident].y = c.y;
                                api.set_color_xy_brightness(light.ident, c.x, c.y, c.bri);
                            }
                        });

                        elems.push(elem);
                    });

                    var count = 0;
                    $.each(elems, function(index, ele) {
                        setTimeout(function() {
                            ele.addClass('nt-slide-show');
                        }, ++count * 100);
                    });
                });
            });
        }

        function _displayLightRename(elem, id, name) {
            var lightName = name;
            var lightId = id;

            var renameContainer = $('<div/>', {
                class: 'rename-container'
            });

            var renameTextBox = $('<input/>', {
                type: 'text',
                class: 'rename-textbox',
                placeholder: lightName
            });

            var confirmButton = $('<button/>', {
                type: 'button',
                class: 'confirm'
            });

            var cancelButton = $('<button/>', {
                type: 'button',
                class: 'cancel'
            });

            renameTextBox.keyup(function(e) {
                // enter
                if (e.which === 13) {
                    var newName = renameTextBox.val().trim();
                    _fireLightRename(lightId, lightName, newName, elem.find('.name'), renameContainer);
                // esc
                } else if (e.which === 27) {
                    _cacnelLightRename(renameContainer);
                }
            });

            confirmButton.click(function() {
                var newName = renameTextBox.val().trim();
                _fireLightRename(lightId, lightName, newName, elem.find('.name'), renameContainer);
            });
            cancelButton.click(function() {
                _cacnelLightRename(renameContainer);
            });

            renameContainer.append(cancelButton, renameTextBox, confirmButton);
            elem.find('.name').prepend(renameContainer);

            renameTextBox.focus();
        }

        function _fireLightRename(id, oldName, newName, nameItem, renamePanel) {
            console.log('request rename[' + oldName + '] confirm');

            if(oldName !== newName) {
                api.rename_light(id, newName)(function() {
                    console.log('requested rename[' + id + ']: ', newName);
                });
                nameItem.text(newName);
                renamePanel.remove();
            } else {
                console.log('undefined newName.');
            }
        }

        function _cacnelLightRename(targetContainer) {
            targetContainer.remove();
        }


        function _lightStatusChanger(elem, status) {
            if (status) {
                elem.find('.on').addClass('active');
                elem.find('.off').removeClass('active');
            } else {
                elem.find('.on').removeClass('active');
                elem.find('.off').addClass('active');
            }
        }
    });
});
