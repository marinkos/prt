// ===================================
// DATEPICKER INITIALIZATION
// ===================================

// Simple datepicker initialization that matches your original script
$(document).ready(function () {
    console.log('DOM ready, initializing datepicker...');
    
    // Check if datepicker is available
    if (typeof $.fn.datepicker === 'undefined') {
        console.error('Datepicker plugin not loaded! Make sure to include the datepicker script before this one.');
        return;
    }
    
    // Initialize datepicker on all elements with data-toggle="datepicker"
    $('[data-toggle="datepicker"]').datepicker({
        format: 'mm-dd-yyyy',
        autoclose: true,
        todayHighlight: true
    });
    
    // Make readonly on mobile devices
    if (window.innerWidth < 768) {
        $('[data-toggle="datepicker"]').attr('readonly', 'readonly');
    }
    
    console.log('Datepicker initialized successfully on', $('[data-toggle="datepicker"]').length, 'elements');
});
