var paceCalculator = (function () {

    'use strict';

    // Utils
    function addclass(el, classname) {
    	if (el.classList) {
    		el.classList.add(classname);
    	} else {
    		el.className += ' ' + classname;
    	}
    }
    function removeclass(el, classname) {
    	if (el.classList) {
    		el.classList.remove(classname);
    	} else {
    		el.className = el.className.replace(new RegExp('(^|\\b)' + classname.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    	}
    }

    var modal = {
        open : function(type, message) {

            addclass(
                document.querySelector('#modal-window'),
                'open'
            );
            document.querySelector('#modal-info').style.display = 'none';
            document.querySelector('#modal-error').style.display = 'none';

            switch (type) {
                case 'info':
                    var t = seconds_to_hhmmss( _get.time() );
                    var d = +(Math.round(_get.distance() + "e+2")  + "e-2");
                    var d_unit = document.querySelector('#distance-unit option:checked');
                    var p = seconds_to_hhmmss( _get.pace() );
                    var p_unit = document.querySelector('#pace-unit option:checked');

                    document.querySelector('#modal-info-time').innerHTML = t.h + 'h ' + t.m + '′ ' + t.s + '″';
                    document.querySelector('#modal-info-distance').innerHTML = d + ' ' + (d_unit.textContent || d_unit.innerText);
                    document.querySelector('#modal-info-pace').innerHTML = p.m + '′ ' + p.s + '″ / ' + (p_unit.textContent || p_unit.innerText);

                    document.querySelector('#modal-info').style.display = 'block';
                    break;

                case 'error':
                    document.querySelector('#modal-error').innerHTML = message;
                    document.querySelector('#modal-error').style.display = 'block';
                    break;

                default:
                    this.close();
            }
        },
        close : function() {
            removeclass(
                document.querySelector('#modal-window'),
                'open'
            );
        }
    }

    var calculate = {
        time : function() {
            if ( !_check.time() ) { modal.open('error', 'To calculate Time, enter the Pace and Distance'); }
            else {
                var time = seconds_to_hhmmss( _get.distance() * _get.pace() * _get.factor() );
                document.querySelector('#time-hours').value = time['h'];
                document.querySelector('#time-minutes').value = time['m'];
                document.querySelector('#time-seconds').value = time['s'];

                modal.open('info');
            }
        },
        distance : function() {
            if ( !_check.distance() ) { modal.open('error', 'To calculate Distance, enter the Time and Pace'); }
            else {
                var distance = _get.time() / ( _get.pace() / _get.factor(true) );
                document.querySelector('#distance-amount').value = distance.toFixed(4);

                modal.open('info');
            }
        },
        pace : function() {
            if ( !_check.pace() ) { modal.open('error', 'To calculate Pace, enter the Time and Distance'); }
            else {
                var pace_sec = ( _get.time() / _get.distance() ) / _get.factor();
                var pace = seconds_to_hhmmss( parseInt(pace_sec) );

                if ( parseInt(pace['h']) > 0 ) {
                    pace['m'] = parseInt(pace['m']) + (parseInt(pace['h'])*60);
                    pace['h'] = 0;
                }
                document.querySelector('#pace-minutes').value = pace['m'];
                document.querySelector('#pace-seconds').value = pace['s'];

                modal.open('info');
            }
        },
        splits : function() {}
    }

    var _check = {
        time : function() { return ( !!_get.distance() && !!_get.pace() ); },
        distance : function() { return ( !!_get.time() && !!_get.pace() ); },
        pace : function() { return ( !!_get.time() && !!_get.distance() ); }
    }

    var _get = {
        factor : function(reverse) {
            var d = document.querySelector('#distance-unit option:checked').value;
            var p = document.querySelector('#pace-unit option:checked').value;
            return (!!reverse) ? convert_units(p, d) : convert_units(d, p);
        },
        time : function() {
            var h = document.querySelector('#time-hours').value;
                h = (h == '') ? 0 : stripZeros(h);
            var m = document.querySelector('#time-minutes').value;
                m = (m == '') ? 0 : stripZeros(m);
            var s = document.querySelector('#time-seconds').value;
                s = (s == '') ? 0 : stripZeros(s);
            var time_seconds = hhmmss_to_seconds(h,m,s);

            return (
                isPositiveNumber(h) &&
                isPositiveNumber(m) &&
                isPositiveNumber(s) &&
                ( time_seconds > 0 )
            ) ? parseFloat(time_seconds) : false;
        },
        distance : function() {
            var el = document.querySelector('#distance-amount');
            var dist = el.value;
                dist = stripZeros( dist.replace(',','.') );
                el.value = dist;

            return (isPositiveNumber(dist) && dist > 0) ? parseFloat(dist) : false;
        },
        pace : function() {
            var m = document.querySelector('#pace-minutes').value;
                m = (m == '') ? 0 : stripZeros(m);
            var s = document.querySelector('#pace-seconds').value;
                s = (s == '') ? 0 : stripZeros(s);
            var time_seconds = hhmmss_to_seconds(0,m,s);

            return (
                isPositiveNumber(m) &&
                isPositiveNumber(s) &&
                ( time_seconds > 0 )
            ) ? parseFloat(time_seconds) : false;
        }
    }

    // -------
    function convert_units(input_unit, output_unit) {
        var conversion_map = {
            'Mile' : {
                'Mile' : 1,
                'Kilometer' : 1.609344,
                'Meter' : 1609.344,
                'Yard' :  1760,
                'Half Mile' : 2,
                'Quarter Mile' : 4,
                'Eigth Mile' : 8,
                '1500M' : 1.072896,
                '800M' : 2.01168,
                '400M' : 4.02336,
                '200M' : 8.04672
            },
            'Kilometer' : {
                'Mile' : 0.6213712,
                'Kilometer' : 1,
                'Meter' : 1000,
                'Yard' :  1093.613,
                'Half Mile' : 1.2427424,
                'Quarter Mile' : 2.4854848,
                'Eigth Mile' : 4.9709696,
                '1500M' : 0.66666666,
                '800M' : 1.25,
                '400M' : 2.5,
                '200M' : 5
            },
            'Meter' : {
                'Mile' : 0.0006213712,
                'Kilometer' : 0.001,
                'Meter' : 1,
                'Yard' :  1.093613,
                'Half Mile' : 0.0012427424,
                'Quarter Mile' : 0.0024854848,
                'Eigth Mile' : 0.0049709696,
                '1500M' : 0.00066666666,
                '800M' : 0.00125,
                '400M' : 0.0025,
                '200M' : 0.005
            },
            'Yard' : {
                'Mile' : 0.0005681,
                'Kilometer' : 0.0009144,
                'Meter' :  0.9144,
                'Yard' : 1,
                'Half Mile' : 0.0011362,
                'Quarter Mile' : 0.0022724,
                'Eigth Mile' : 0.0045448,
                '1500M' : 0.0006096,
                '800M' : 0.001143,
                '400M' : 0.002286,
                '200M' : 0.004572
            }
        };
        return conversion_map[input_unit][output_unit];
    }

    // -------
    function hhmmss_to_seconds(hours, minutes, seconds) {
        return parseFloat( hours * 3600 ) + parseFloat( minutes * 60 ) + parseFloat( seconds );
    }

    function seconds_to_hhmmss(seconds) {
        var h = Math.floor( seconds/3600 );
        var m = Math.floor( seconds/60 ) - ( h*60 );
        var s = seconds - (m*60) - (h*3600);

        return  {
            h : ("0" + h).slice (-2),
            m : ("0" + m).slice (-2),
            s : ("0" + s).slice (-2)
        }
    }

    function stripZeros(inputNumber) {
        var n = parseFloat(inputNumber);
        return ( !isNaN(n) ) ? n : 0;
    }

    function isPositiveNumber(inputNumber) {
        var n = parseFloat(inputNumber);
        return (!isNaN(n) && n >= 0);
    }
    // -------

    function set_distance_unit(el) {
        var selected = document.querySelector('#'+el+' option:checked').getAttribute('value');
            selected = selected.split('-');

            if ( selected.length == 2 ) {

                var unit = (selected[1] == 'K') ? 'Kilometer' : 'Mile';
                document.querySelector('#distance-amount').value = selected[0];

                var unit_opts = document.querySelectorAll('#distance-unit option');
                for (var i = 0; i < unit_opts.length; i++) {
            		unit_opts[i].removeAttribute('selected');
            	}
                document.querySelector('#distance-unit option[value='+unit+']').setAttribute('selected', 'selected');
            }
    }

    return {
        init : function() {
            document.querySelector('#event-select').onchange = function() {
                set_distance_unit( this.getAttribute('id') );
            };
            document.querySelector('#calculate-time').onclick = function(e) { calculate.time(); e.preventDefault(); this.blur(); };
            document.querySelector('#calculate-distance').onclick = function(e) { calculate.distance(); e.preventDefault(); this.blur(); };
            document.querySelector('#calculate-pace').onclick = function(e) { calculate.pace(); e.preventDefault(); }

            document.querySelector('#modal-alright').onclick = function() {
                modal.close();
            }

        }
    };

}());
