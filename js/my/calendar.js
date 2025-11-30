const current_date = new Date()
current_date.setHours(0, 0, 0, 0)
const date_accept = new Date()
date_accept.setHours(0, 0, 0, 0)
date_accept.setDate(date_accept.getDate() + 2)

const vm = Vue.createApp({
  data() {
    return {
      year: current_date.getFullYear(),
      month: current_date.getMonth(),
      months: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ],
      week: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      reservation_type: 'novalue',
      count_time: 0,
      count_people: 0,
      chairs: 0,
      tables: 0,
      tablecloths: 0,
      assistants: 0,
      total: 0,
      selected_date: null,
      reservated_dates: reservations,
      button: null,
      messague: 'Click sobre la fecha a reservar'
    }
  },
  methods: {
    clear_fields() {
      this.reservation_type = 'novalue'
      this.count_time = 0
      this.count_people = 0
      this.chairs = 0
      this.tables = 0
      this.tablecloths = 0
      this.assistants = 0
      this.total = 0
    },
    next_month() {
      this.reservated_dates = {}
      if (this.month < 11) this.month++
      else {
        this.month = 0
        this.year++
      }

      $.post(
        '../../ajax/getReservations.php',
        {
          year: this.year,
          month: this.month + 1
        },
        (data, status) => {
          if (status === 'success') {
            this.reservated_dates = JSON.parse(data)
          }
        }
      )
    },
    previous_month() {
      this.reservated_dates = {}
      if (this.month > 0) this.month--
      else {
        this.month = 11
        this.year--
      }

      $.post(
        '../../ajax/getReservations.php',
        {
          year: this.year,
          month: this.month + 1
        },
        (data, status) => {
          if (status === 'success') {
            this.reservated_dates = JSON.parse(data)
          }
        }
      )
    },
    select_date(index_week, index_day) {
      const day_elem = $(
        '#cal > div:nth-child(' +
          (index_week + 1) +
          ') > div:nth-child(' +
          (index_day + 1) +
          ') > div'
      )
      if (day_elem.hasClass('disabled')) return

      const date_select = new Date(
        this.year,
        this.month,
        this.calendar[index_week][index_day]
      )
      date_select.setHours(0, 0, 0, 0)
      this.selected_date = date_select
      this.validateSelectedDate()
    },
    get_class_date(day) {
      if (this.reservated_dates[day]) {
        return this.reservated_dates[day][1]
          ? 'reservated disabled'
          : 'on-hold disabled'
      }
      const date_for_day = new Date(this.year, this.month, day)
      date_for_day.setHours(0, 0, 0, 0)

      if (date_for_day < date_accept) return 'disabled'
      if (
        this.is_this_month_selected_date &&
        day === this.selected_date.getDate()
      )
        return 'selected disabled'

      return 'btn-success'
    },
    validateSelectedDate() {
      if (this.selected_date) {
        this.button = `
          <button type="button" class="mt-4 btn btn-primary bg-dark border-0" onclick="newReservation()">
            Reservar este dia
          </button>`
        this.messague = "Presione el boton 'Reservar este dia'"
      } else {
        this.button = null
        this.messague = 'Click sobre la fecha a reservar'
      }
    }
  },
  computed: {
    days_each_month() {
      const days_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      if (
        (this.year % 4 === 0 && this.year % 100 !== 0) ||
        this.year % 400 === 0
      )
        days_month[1] = 29
      return days_month
    },
    days_first_week() {
      return 7 - new Date(this.year, this.month, 1).getDay()
    },
    days_last_week() {
      return (this.days_each_month[this.month] - this.days_first_week) % 7
    },
    calendar() {
      const cal = []
      cal.push([])
      // First week
      const first_week_days = this.days_first_week + 1
      for (let day = 1; day < first_week_days; day++) cal[0].push(day)

      // Next weeks
      const weeks = Math.floor(
        (this.days_each_month[this.month] - this.days_first_week) / 7
      )
      for (let week = 0; week < weeks; week++) {
        cal.push([])
        for (let day = 1; day <= 7; day++) {
          cal[week + 1].push(week * 7 + day + this.days_first_week)
        }
      }

      // Last week
      if (this.days_last_week) {
        cal.push([])
        for (let day = 1; day <= this.days_last_week; day++) {
          cal[weeks + 1].push(weeks * 7 + day + this.days_first_week)
        }
      }

      return cal
    },
    is_this_month_selected_date() {
      return (
        this.selected_date &&
        this.year === this.selected_date.getFullYear() &&
        this.month === this.selected_date.getMonth()
      )
    }
  }
}).mount('#app')

function newReservation() {
  if (document.getElementById('msg-error-successful')) {
    $('#msg-error-successful').remove()
  }
  $.ajax({
    data: {
      year: JSON.stringify(vm.selected_date.getFullYear()),
      month: JSON.stringify(vm.selected_date.getMonth() + 1),
      date: JSON.stringify(vm.selected_date.getDate()),
      day: JSON.stringify(vm.selected_date.getDay())
    },
    type: 'post',
    dataType: 'json',
    url: '../../ajax/my/prepareNewReservation.php'
  })
    .done(function (data) {
      if (data === 'N') {
        if (!document.getElementById('msg-error-successful')) {
          $('#box-message').append(`
            <p id="msg-error-successful" class="mb-0 mt-2 alert alert-info alert-dismissible fade show text-center" role="alert">
              La fecha seleccionada no es un dia laboral
              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button> 
            </p>
          `)
          $('html, body').animate(
            {
              scrollTop: $('#box-message').offset().top - 150
            },
            500
          )
        }
      } else {
        location.reload()
      }
    })
    .fail(function () {
      console.log('Error en la reserva')
    })
}
