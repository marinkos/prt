//Tabs on hover
$('.areas_tabs-link').hover(
    function() {
      $( this ).click();
    }
  );

//Slick slider
$(document).ready(function() {
      // Calculate slides to show based on window width
      let calculatedSlidesToShow = 1;
      if (window.innerWidth >= 768) {
        calculatedSlidesToShow = 3;
      } else if (window.innerWidth >= 480) {
        calculatedSlidesToShow = 2;
      }
      
      $('.features_component').slick({
        centerMode: true,
        centerPadding: '30px',
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: calculatedSlidesToShow,
        slidesToScroll: 1,
      });
  });