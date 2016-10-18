$(document).ready(function() {
    console.log('Client is ready');
    var button = $('.button');
    var mic = button.find('svg');
    var active = $('.active-wrapper');
    var stop = $('.stop-button');
    var w = $(window);
    var vw = w.innerWidth();
    var vh = w.innerHeight();
    var bw = button.innerWidth();
    var bh = button.innerHeight();
    var s;

    var clone = button.clone();
    clone.find('svg').remove();
    button.before(clone);

    function close() {
        active.removeClass('active');
        clone.removeAttr('style');
        mic.removeAttr('style');
        // Stop recording sound 
        stopRecording();
    }

    function open() {
        if (vw > vh) {
            s = vw / bw * 1.5;
        } else {
            s = vh / bh * 1.5;
        }
        var scale = 'scale(' + s + ') translate(-50%,-50%)';

        clone.css({
            transform: scale
        });

        mic.css({
            fill: 'rgba(0,0,0,0.2)',
            transform: 'scale(4)'
        });

        button.on('transitionend', function() {
            active.addClass('active');
            $(this).off('transitionend');
        });

        // Start recording sound and process here
        startRecording();

        return false;
    }

    $('.button').click(function(event) {
        setTimeout(function() {
            close();
        }, 5000);
        open();
    });

    $('.stop-button').click(function(event) {
        close();
    })
});
