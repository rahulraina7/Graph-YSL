 $(document).ready(function() {
                // This command is used to initialize some elements and make them work properly
                $.material.init();
                
     
            });


var searchBox = function(){
    
    $('a[id="searchButton"]').on('click', function(event) {
        console.log("click true");
        event.preventDefault();
        $('#search').addClass('open');
        $('#search > form > input[type="search"]').focus();
    });
    
    $('#search, #search button.close').on('click keyup', function(event) {
        if (event.target == this || event.target.className == 'close' || event.keyCode == 27) {
            $(this).removeClass('open');
        }
    });
    
    
    //Do not include! This prevents the form from submitting for DEMO purposes only!
    /*$('form').submit(function(event) {
        event.preventDefault();
        return false;
    })*/

};