( document ).ready(function() {
    $("#element_that_opens_modal").click(function(){
        $("#modal_div").show();
    });

    window.onclick = function(event) {
       if (event.target.id != "image_in_modal_div") {
          $("#modal_div").hide();
       }
    }

});