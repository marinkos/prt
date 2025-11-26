//Tabs on hover
$('.areas_tabs-link').hover(
    function() {
      $( this ).click();
    }
  );

//Slick slider
$(document).ready(function() {
      $('.slider_component').slick({
        centerMode: true,
        centerPadding: '30px',
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
              centerPadding: '20px'
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              centerPadding: '10px'
            }
          }
        ]
      });
  });