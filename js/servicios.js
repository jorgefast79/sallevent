// servicios.js

var current_date = new Date();
current_date.setHours(0,0,0,0);
var date_accept = new Date();
date_accept.setHours(0,0,0,0);
date_accept.setDate(date_accept.getDate() + 2);

var app = Vue.createApp({
    data() {
        return {
            year: current_date.getFullYear(),
            month: current_date.getMonth(),
            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            week: ['Do','Lu','Ma','Mi','Ju','Vi','Sa'],
            reservation_type: 'novalue',
            count_time: 0,
            count_people: 0,
            chairs: 0,
            tables: 0,
            tablecloths: 0,
            assistants: 0,
            total: 0,
            selected_date: null,
            reservated_dates: reservations
        };
    },
    methods: {
        clear_fields() {
            this.reservation_type = 'novalue';
            this.count_time = 0;
            this.count_people = 0;
            this.chairs = 0;
            this.tables = 0;
            this.tablecloths = 0;
            this.assistants = 0;
            this.total = 0;
        },
        next_month() {
            this.reservated_dates = {};
            if(this.month < 11) this.month++;
            else { this.month = 0; this.year++; }

            var self = this;
            $.post("../ajax/getReservations.php", {year:self.year, month:self.month+1}, function(data, status){
                if(status === 'success') self.reservated_dates = JSON.parse(data);
            });
        },
        previuos_month() {
            this.reservated_dates = {};
            if(this.month > 0) this.month--;
            else { this.month = 11; this.year--; }

            var self = this;
            $.post("../ajax/getReservations.php", {year:self.year, month:self.month+1}, function(data, status){
                if(status === 'success') self.reservated_dates = JSON.parse(data);
            });
        },
        select_date(index_week, index_day) {
            var cell = $('#cal > div:nth-child('+(index_week+1)+') > div:nth-child('+(index_day+1)+') > div');
            if(cell.hasClass('disabled')) return;

            let date_select = new Date(this.year, this.month, this.calendar[index_week][index_day]);
            date_select.setHours(0,0,0,0);
            this.selected_date = date_select;
        },
        get_class_date(day){
            if(this.reservated_dates[day]){
                if(this.reservated_dates[day][1]) return "reservated disabled";
                else return "on-hold disabled";
            }
            let date_for_day = new Date(this.year, this.month, day, 0,0,0,0);
            if(date_for_day < date_accept) return "disabled";
            if(this.is_this_month_selected_date && day === this.selected_date.getDate()) return "selected disabled";
            return "btn-success";
        }
    },
    computed: {
        days_each_month() {
            let days_month = [31,28,31,30,31,30,31,31,30,31,30,31];
            if((this.year%4===0 && this.year%100!==0)||this.year%400===0) days_month[1]=29;
            return days_month;
        },
        days_first_week() {
            return 7 - new Date(this.year,this.month,1).getDay();
        },
        days_last_week() {
            return (this.days_each_month[this.month]-this.days_first_week)%7;
        },
        calendar() {
            let cal=[[]];
            // first week
            for(let d=1; d<this.days_first_week+1; d++) cal[0].push(d);

            let weeks = Math.floor((this.days_each_month[this.month]-this.days_first_week)/7);
            for(let w=0; w<weeks; w++){
                cal.push([]);
                for(let d=1; d<8; d++) cal[w+1].push(w*7+d+this.days_first_week);
            }

            if(this.days_last_week){
                cal.push([]);
                for(let d=1; d<this.days_last_week+1; d++) cal[weeks+1].push(weeks*7+d+this.days_first_week);
            }

            return cal;
        },
        is_this_month_selected_date() {
            return this.selected_date &&
                   this.year === this.selected_date.getFullYear() &&
                   this.month === this.selected_date.getMonth();
        }
    }
});

app.mount('#app');

// jQuery for event "other" option
$(document).ready(function() {
    $("#event").change(function() {
        if ($("#event").val() === "other") {
            $("#eventother").append(
                `<div id="boxotheranother" class="col-md-8 mb-2 d-flex flex-wrap justify-content-center mb-3">
                    <label for="writeanother" class="mr-2 mt-1">Menciónelo: </label>
                    <input type="text" name="values[]" id="writeanother" class="mb-1" min="0" />
                </div>`
            );
        } else {
            $("#boxotheranother").remove();
        }
    });
});

// Validations
function validateForm() {
    if ($("#boxotheranother").length && $("#writeanother").val().trim() === "") return showMessage(), false;
    if ($("#event").val() === "") return showMessage(), false;

    if(!validateTime("#start-time")) return false;
    if(!validateTime("#final-time")) return false;

    $("#boxservices input").each(function() {
        if(!validateService("#"+this.id)) return false;
    });

    return true;
}

function validateTime(id){
    let val = $(id).val();
    if(isNaN(val) || val.trim() === "" || val%1!==0 || val<1 || val>12) return showMessage(), false;
    return true;
}

function validateService(id){
    let val = $(id).val();
    if(isNaN(val) || val.trim()==="" || val%1!==0 || val<0) return showMessage(), false;
    return true;
}

function showMessage(){
    if(!$("#msg-error-successful").length){
        $("#box-confirmpass").append(
            `<p id="msg-error-successful" class="mb-0 mt-2 alert alert-danger alert-dismissible fade show" role="alert">
                ¡Vaya! Rellene o corrija los datos
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button> 
            </p>`
        );
    }
    $('html, body').animate({scrollTop: $("#box-confirmpass").offset().top-150}, 500);
    $("#total").val("");
}

function restore(){
    $("#boxotheranother").remove();
    $("#total").val("");
}

// Quote calculation
function quote(){
    if(!validateForm()) return;

    var starthour = ($("#start-time-select").val().toLowerCase() === "am") ?
        parseInt($("#start-time").val()) : parseInt($("#start-time").val()) + 12;
    if(starthour === 12 || starthour === 24) starthour -= 12;

    var finalhour = ($("#final-time-select").val().toLowerCase() === "am") ?
        parseInt($("#final-time").val()) : parseInt($("#final-time").val()) + 12;
    if(finalhour === 12 || finalhour === 24) finalhour -= 12;

    if(starthour >= finalhour) return showMessage();

    $("#msg-error-successful").remove();

    var datesForm = [starthour, finalhour];
    $("#boxservices input").each(function() {
        datesForm.push(this.id, this.value);
    });

    $.ajax({
        url: "../ajax/my/quoteRental.php",
        type: "POST",
        data: {datesForm},
        dataType: "json"
    }).done(function(data){
        $("#total").val(data);
    }).fail(function(){
        console.log("Error al cotizar");
    });
}
