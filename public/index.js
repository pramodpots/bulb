$(document).ready(function() {

    $('.border-pink').mouseover(function() {
        $(this).css('background-color', '#F8BBD0');
        $(this).mouseout(function() {
            $(this).css('background-color', '');
        })
    });

    $('.border-blue').mouseover(function() {
        $(this).css('background-color', 'black');
        $(this).css('color', 'white');
        $(this).mouseout(function() {
            $(this).css('background-color', '');
            $(this).css('color', 'black');
        })
    });
});
