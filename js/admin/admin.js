const vm = Vue.createApp({
  data() {
    return {
      data_admin: data_admin,
      data_salon: data_salon,
      data_customers: data_customers,
      modal_customer: {
        id_user: 1,
        user_user: '',
        name_user: '',
        pa_lastname_user: '',
        mo_lastname_user: '',
        email_user: '',
        phone_user: '',
        password_user: ''
      },
      is_modal_update_admin: false,
      is_modal_create: true,
      index_modal_customer: 0,
      state_inputs_modal: {
        name_user: false,
        user_user: false,
        pa_lastname_user: false,
        mo_lastname_user: false,
        email_user: false,
        phone_user: false,
        password_user: false
      },
      user_already_exists: {
        state: false,
        value: ''
      },
      is_active_success_email: false,
      type_select_reservations: 'all',
      data_reservations: {
        confirmed: [],
        unconfirmed: []
      },
      total_reservations: total_reservations,
      data_services: data_services,
      modal_service: {
        id_service: 1,
        name_service: '',
        price: 0,
        detail: ''
      },
      is_modal_service_create: true,
      index_service: 0,
      // variables para el manejo de páginas
      id_page_current: '#customers',
      id_option_current: '#opt-customers'
    }
  },

  methods: {
    /* ----------- Métodos de validación ----------- */
    is_valid_user() {
      if (this.modal_customer.user_user) {
        if (this.user_already_exists.state) {
          if (this.user_already_exists.value == this.modal_customer.user_user) {
            this.state_inputs_modal.user_user = false
            this.create_error_user_modal()
            return
          }
          $('#bxm-error-user').remove()
        }
        this.state_inputs_modal.user_user = true
      } else {
        this.state_inputs_modal.user_user = false
      }
    },

    is_valid_email() {
      if (
        /^\w+(\.|-|\w)*@\w+(\.|-|\w)*$/.test(this.modal_customer.email_user)
      ) {
        if (this.is_modal_create) {
          $('#bxm-email').removeClass('error-input').addClass('success-input')
          this.is_active_success_email = true
          this.state_inputs_modal.email_user = true
        } else if (this.is_modal_update_admin) {
          if (this.data_admin.email_user != this.modal_customer.email_user) {
            $('#bxm-email').removeClass('error-input').addClass('success-input')
          } else {
            $('#bxm-email')
              .removeClass('success-input')
              .removeClass('error-input')
          }
          this.is_disable_btn_modal = !this.is_valid_for_update(
            this.modal_customer,
            this.data_admin
          )
        } else {
          if (
            this.data_customers[this.index_modal_customer].email_user !=
            this.modal_customer.email_user
          ) {
            $('#bxm-email').removeClass('success-input').addClass('error-input')
          } else {
            $('#bxm-email')
              .removeClass('success-input')
              .removeClass('error-input')
          }
          this.is_disable_btn_modal = !this.is_valid_for_update(
            this.modal_customer,
            this.data_customers[this.index_modal_customer]
          )
        }
      } else {
        this.state_inputs_modal.email_user = false
        if (this.is_modal_create && this.is_active_success_email) {
          $('#bxm-email').removeClass('success-input').addClass('error-input')
          this.is_active_success_email = false
        } else {
          $('#bxm-email').removeClass('success-input').addClass('error-input')
        }
      }
    },

    onch_is_valid_email() {
      if (
        !/^\w+(\.|-|\w)*@\w+(\.|-|\w)*$/.test(this.modal_customer.email_user)
      ) {
        $('#bxm-email').addClass('error-input')
      }
    },

    is_valid_input(key) {
      if (this.modal_customer[key]) {
        if (this.is_modal_create) {
          this.state_inputs_modal[key] = true
        } else if (this.is_modal_update_admin) {
          this.is_disable_btn_modal = !this.is_valid_for_update(
            this.modal_customer,
            this.data_admin
          )
        } else {
          this.is_disable_btn_modal = !this.is_valid_for_update(
            this.modal_customer,
            this.data_customers[this.index_modal_customer]
          )
        }
      } else {
        this.state_inputs_modal[key] = false
      }
    },

    /* ----------- Métodos de reservas ----------- */
    get_reservations() {
      this.data_reservations = { confirmed: [], unconfirmed: [] }
      let type_select =
        this.type_select_reservations === 'all'
          ? 'all'
          : this.type_select_reservations
      $.post(
        '../ajax/admin/selectReservations.php',
        { select_reservations: type_select },
        (data, status) => {
          if (status == 'success') {
            const data_parse = JSON.parse(data)
            if (data_parse.type == 'all') {
              this.data_reservations.confirmed = data_parse.confirmed
              this.data_reservations.unconfirmed = data_parse.unconfirmed
              if (
                !data_parse.confirmed.length &&
                !data_parse.unconfirmed.length
              ) {
                this.create_notification(
                  '<strong>Vació</strong>: No hay reservaciones',
                  'alert-success',
                  'reservations'
                )
              }
            } else if (data_parse.type == 'confirmed') {
              if (data_parse.confirmed.length)
                this.data_reservations.confirmed = data_parse.confirmed
              else
                this.create_notification(
                  '<strong>Vació</strong>: No hay reservaciones confirmadas',
                  'alert-success',
                  'reservations'
                )
            } else {
              if (data_parse.unconfirmed.length)
                this.data_reservations.unconfirmed = data_parse.unconfirmed
              else
                this.create_notification(
                  '<strong>Vació</strong>: No hay reservaciones por confirmar',
                  'alert-success',
                  'reservations'
                )
            }
          } else {
            this.create_notification(
              '<strong>Error</strong>: No se pudieron obtener los datos. Conexión fallida',
              'alert-danger',
              'reservations'
            )
          }
        }
      )
    },

    confirm_reservation(index_reserv) {
      const reservation = this.data_reservations.unconfirmed[index_reserv]
      $.post(
        '../ajax/admin/confirmReservation.php',
        { id_reservation: reservation.id_reservation },
        (data, status) => {
          if (status == 'success') {
            if (this.type_select_reservations == 'all') {
              this.data_reservations.confirmed.unshift(
                this.data_reservations.unconfirmed.splice(index_reserv, 1)[0]
              )
            } else {
              this.data_reservations.unconfirmed.splice(index_reserv, 1)
            }
            this.total_reservations.unconfirmed--
            this.total_reservations.confirmed++
            this.create_notification(
              '<strong>Exitoso</strong>: Reservación confirmada',
              'alert-success',
              'reservations'
            )
          } else {
            this.create_notification(
              '<strong>Error</strong>: No se pudo confirmar la reservación. Conexión fallida',
              'alert-danger',
              'reservations'
            )
          }
        }
      )
    },

    /* ----------- Método de actualización del salón ----------- */
    update_salon() {
      $.post(
        '../ajax/admin/createOrUpdateRoom.php',
        { 'data-salon': JSON.stringify(this.data_salon) },
        (data, status) => {
          if (status == 'success') {
            const parse_data = JSON.parse(data)
            if (parse_data.status) {
              let status_msg =
                'actualizó correctamente la información del salón de eventos'
              if (parse_data.action == 'create') {
                this.data_salon.t_room.id_saloon = parse_data.t_room
                this.data_salon.t_room.id_info = parse_data.t_info
                this.data_salon.t_direction.id_direction =
                  parse_data.t_direction
                this.data_salon.t_schedule.id_schedule = parse_data.t_schedule
                status_msg = 'registro correctamente el salón de eventos'
              }
              this.create_notification(
                '<strong>Exitoso</strong> Se ' + status_msg,
                'alert-success',
                'salon'
              )
            } else {
              let status_msg =
                'actualizar correctamente la información del salón de eventos\nError al actualizar datos en la tabla ' +
                parse_data.in_table
              if (parse_data.action == 'create')
                status_msg =
                  'registrar correctamente el salón de eventos\nError al registrar datos en la tabla ' +
                  parse_data.in_table
              this.create_notification(
                '<strong>Error</strong>: No se pudo ' + status_msg,
                'alert-danger',
                'salon'
              )
            }
          } else {
            this.create_notification(
              '<strong>Error</strong>: Conexión fallida',
              'alert-danger',
              'salon'
            )
          }
        }
      )
    },
    /* ------------------------------------ */
    /* Métodos de usuarios y administración */
    /* ------------------------------------ */
    modify_admin() {
      this.is_modal_create = false
      this.is_modal_update_admin = true
      this.restart_modal()
      $('#box-modify-customer').modal({
        backdrop: 'static',
        keyboard: false
      })
    },

    update_admin() {
      $.post(
        '../ajax/admin/updateUser.php',
        {
          data_user: JSON.stringify(this.modal_customer)
        },
        (data, status) => {
          if (status == 'success') {
            if (JSON.parse(data).status) {
              this.data_admin = JSON.parse(JSON.stringify(this.modal_customer))
              this.create_notification(
                '<strong>Exitoso</strong>: Se actualizo correctamente tu información',
                'alert-success',
                'personal-information'
              )
              return
            }
          }
          this.create_notification(
            '<strong>Error</strong>: No se pudo actualizar tu información',
            'alert-danger',
            'personal-information'
          )
        }
      )
      $('#box-modify-customer').modal('hide')
    },

    modify_customer(index_customer) {
      this.is_modal_create = false
      this.index_modal_customer = index_customer
      this.is_modal_update_admin = false
      this.restart_modal()
      $('#box-modify-customer').modal({
        backdrop: 'static',
        keyboard: false
      })
    },

    create_or_update_customer() {
      if (this.is_disable_btn_modal) return
      if (this.is_modal_create) {
        this.create_customer()
      } else if (this.is_modal_update_admin) {
        this.update_admin()
      } else {
        this.update_customer()
      }
    },

    update_customer() {
      $.post(
        '../ajax/admin/updateUser.php',
        {
          data_user: JSON.stringify(this.modal_customer)
        },
        (data, status) => {
          if (status == 'success') {
            if (JSON.parse(data).status) {
              this.data_customers.splice(
                this.index_modal_customer,
                1,
                JSON.parse(JSON.stringify(this.modal_customer))
              )
              this.create_notification(
                '<strong>Exitoso</strong>: Se actualizo correctamente la información de ' +
                  this.modal_customer.user_user,
                'alert-success',
                'customers'
              )
              return
            }
          }
          this.create_notification(
            '<strong>Error</strong>: No se pudo actualizar la información de ' +
              this.modal_customer.user_user,
            'alert-danger',
            'customers'
          )
        }
      )
      $('#box-modify-customer').modal('hide')
    },

    remove_customer(index_customer) {
      $.post(
        '../ajax/admin/deleteUser.php',
        {
          id_user: this.data_customers[index_customer].id_user
        },
        (data, status) => {
          if (status == 'success') {
            let data_parse = JSON.parse(data)
            if (data_parse.status) {
              this.create_notification(
                '<strong>Exitoso</strong>: Se elimino correctamente al usuario ' +
                  this.data_customers[index_customer].user_user,
                'alert-success',
                'customers'
              )
              this.data_customers.splice(index_customer, 1)
              return
            } else if (data_parse.type == 'exists_reservations') {
              this.create_notification(
                '<strong>Warning</strong>: ' +
                  this.data_customers[index_customer].user_user +
                  ' tiene reservaciones sin concluir. No se puede eliminar',
                'alert-warning',
                'customers'
              )
              return
            }
          }
          this.create_notification(
            '<strong>Error</strong>: No se pudo eliminar al usuario ' +
              this.data_customers[index_customer].user_user,
            'alert-danger',
            'customers'
          )
        }
      )
    },

    fill_customer() {
      this.is_modal_create = true
      this.restart_modal()
      $('#box-modify-customer').modal({
        backdrop: 'static',
        keyboard: false
      })
    },

    create_customer() {
      $.post(
        '../ajax/admin/createUser.php',
        {
          data_user: JSON.stringify(this.modal_customer)
        },
        (data, status) => {
          if (status == 'success') {
            let parse_data = JSON.parse(data)
            if (parse_data.status) {
              this.modal_customer.id_user = parse_data.id_user
              this.data_customers.unshift(
                JSON.parse(JSON.stringify(this.modal_customer))
              )
              $('#box-modify-customer').modal('hide')
              this.create_notification(
                '<strong>Exitoso</strong>: Se registro el usuario ' +
                  this.modal_customer.user_user,
                'alert-success',
                'customers'
              )
              return
            } else if (parse_data.type == 'user_already_exists') {
              this.user_already_exists.state = true
              this.user_already_exists.value = this.modal_customer.user_user
              this.state_inputs_modal.user_user = false
              this.create_error_user_modal()
              return
            }
          }
          $('#box-modify-customer').modal('hide')
          this.create_notification(
            '<strong>Error</strong>: No se pudo registrar el usuario; conexión fallida',
            'alert-danger',
            'customers'
          )
        }
      )
    },

    /* ------------------------------------ */
    /* Métodos de servicios */
    /* ------------------------------------ */
    fill_service() {
      this.is_modal_service_create = true
      this.restart_modal_service()
      $('#box-services').modal({
        backdrop: 'static',
        keyboard: false
      })
    },

    create_or_update_service() {
      if (this.is_modal_service_create) this.create_service()
      else this.update_service()
    },

    create_service() {
      $.post(
        '../ajax/admin/createService.php',
        { data_service: JSON.stringify(this.modal_service) },
        (data, status) => {
          if (status == 'success') {
            let data_parse = JSON.parse(data)
            if (data_parse.status) {
              this.modal_service.id_service = data_parse.id_service
              this.data_services.unshift(
                JSON.parse(JSON.stringify(this.modal_service))
              )
              this.create_notification(
                '<strong>Exitoso</strong>: Se registro correctamente el servicio',
                'alert-success',
                'services'
              )
              return
            }
          }
          this.create_notification(
            '<strong>Error</strong>: No se pudo registrar el servicio',
            'alert-danger',
            'services'
          )
        }
      )
      $('#box-services').modal('hide')
    },

    modify_service(index_service) {
      this.index_service = index_service
      this.is_modal_service_create = false
      this.restart_modal_service()
      $('#box-services').modal({
        backdrop: 'static',
        keyboard: false
      })
    },

    update_service() {
      $.post(
        '../ajax/admin/updateService.php',
        { data_service: JSON.stringify(this.modal_service) },
        (data, status) => {
          if (status == 'success') {
            if (JSON.parse(data).status) {
              this.data_services.splice(
                this.index_service,
                1,
                JSON.parse(JSON.stringify(this.modal_service))
              )
              this.create_notification(
                '<strong>Exitoso</strong>: Se ha actualizdo la información del servicio',
                'alert-success',
                'services'
              )
              return
            }
          }
          this.create_notification(
            '<strong>Error</strong>: No se pudo actualizar la información del servicio',
            'alert-danger',
            'services'
          )
        }
      )
      $('#box-services').modal('hide')
    },

    restart_modal_service() {
      if (this.is_modal_service_create)
        this.modal_service = {
          id_service: 1,
          name_service: '',
          price: 0,
          detail: ''
        }
      else
        this.modal_service = JSON.parse(
          JSON.stringify(this.data_services[this.index_service])
        )
    },

    /* ------------------------------------ */
    /* Métodos de validación y utilidades */
    /* ------------------------------------ */
    restart_modal() {
      if (this.is_modal_create) {
        this.modal_customer = {
          id_user: 1,
          user_user: '',
          name_user: '',
          pa_lastname_user: '',
          mo_lastname_user: '',
          email_user: '',
          phone_user: '',
          password_user: ''
        }
      } else if (this.is_modal_update_admin) {
        this.modal_customer = JSON.parse(JSON.stringify(this.data_admin))
      } else {
        this.modal_customer = JSON.parse(
          JSON.stringify(this.data_customers[this.index_modal_customer])
        )
      }
      this.is_disable_btn_modal = true
      this.is_active_success_email = false
    },

    is_valid_for_update(data_copy, data_origin) {
      let everyone_has_data = true
      let there_is_modification = false
      for (const key in data_copy) {
        if (!data_copy[key]) {
          everyone_has_data = false
          break
        }
      }
      if (everyone_has_data) {
        for (const key in data_copy) {
          if (data_copy[key] != data_origin[key]) {
            there_is_modification = true
          }
        }
      }
      return everyone_has_data && there_is_modification
    },

    /* ------------------------------------ */
    /* Métodos de manejo de páginas (antes globales) */
    /* ------------------------------------ */
    loadPage(id_page) {
      if (this.activeOption(id_page)) {
        this.showPage(id_page)
      }
    },

    activeOption(id_page) {
      const optionId = '#opt-' + id_page
      if ($(optionId).hasClass('option-selected')) return false

      if (this.id_option_current) {
        $(this.id_option_current).removeClass('option-selected')
      }

      this.id_option_current = optionId
      $(this.id_option_current).addClass('option-selected')

      return true
    },

    showPage(id_page) {
      if (this.id_page_current) {
        $(this.id_page_current).css('display', 'none')
      }
      this.id_page_current = '#' + id_page
      $(this.id_page_current).css('display', 'block')
    },

    /* ------------------------------------ */
    /* Funciones de notificaciones */
    /* ------------------------------------ */
    create_notification(message, type_notification, section) {
      let alert = '#' + section + '>div.alert:first-child'
      $('#' + section + '> div:last-child').before(
        '<div class="alert ' +
          type_notification +
          ' alert-dismissible fade show text-center" role="alert">' +
          message +
          '<button type="button" class="close" data-dismiss="alert" aria-label="close">' +
          '<span aria-hidden="true">&times;</span></button>'
      )
      setTimeout(() => {
        if (document.querySelector(alert)) $(alert).alert('close')
      }, 6000)
    },

    create_error_user_modal() {
      $('#box-modify-customer div.modal-body > div:first-child').after(
        '<p id="bxm-error-user" class="text-danger">Este usuario ya existe, especifique otro usuario</p>'
      )
    },

    show_or_hide_password(id_button, id_input) {
      $(id_button).toggleClass('fa-eye-slash fa-eye')
      if ($(id_input).attr('type') == 'password')
        $(id_input).attr('type', 'text')
      else $(id_input).attr('type', 'password')
    }
  },

  computed: {
    modal_data() {
      if (this.is_modal_create) {
        return {
          title: 'Agregue los datos para el ',
          strong: 'nuevo usuario',
          text_btn: 'Crear usuario',
          style_user: {
            display: 'flex'
          }
        }
      }
      return {
        title: 'Modificar información de ',
        strong: this.modal_customer.user_user,
        text_btn: 'Actualizar',
        style_user: {
          display: 'none'
        }
      }
    },

    is_disable_btn_modal: {
      get() {
        for (const key in this.state_inputs_modal) {
          if (!this.state_inputs_modal[key]) return true
        }
        return false
      },
      set(new_state) {
        for (const key in this.state_inputs_modal) {
          this.state_inputs_modal[key] = !new_state
        }
      }
    },

    modal_data_service() {
      if (this.is_modal_service_create) {
        return {
          title: 'Agregue los datos para el ',
          strong: 'nuevo servicio',
          text_btn: 'Crear servicio'
        }
      }
      return {
        title: 'Modificar información del servicio: ',
        strong: this.modal_service.name_service,
        text_btn: 'Actualizar'
      }
    }
  }
}).mount('#app')

/* ------------------------------------ */
/* Código jQuery que sigue igual         */
/* ------------------------------------ */
$(document).ready(function () {
  $('.list-group span').on('click', function () {
    $('.navbar-toggler').click()
  })

  let c_date = new Date()
  $('#customers > div > h4').text(
    c_date.getDate() +
      '/' +
      (c_date.getMonth() + 1) +
      '/' +
      c_date.getFullYear()
  )

  $('#search-customers').on('input', function () {
    $.post(
      '../ajax/admin/selectUserForUser.php',
      {
        user: $(this).val()
      },
      function (data, status) {
        if (status == 'success') {
          let parse_data = JSON.parse(data)
          if (parse_data.value) {
            vm.data_customers = parse_data.data_customers
          } else {
            vm.data_customers = []
          }
        }
      }
    )
  })

  $('#box-modify-customer').on('hidden.bs.modal', function () {
    if (document.getElementById('bxm-error-user')) {
      $('#bxm-error-user').remove()
    }
    $('#bxm-email').removeClass('error-input').removeClass('success-input')
  })

  $('#search-services').on('input', function () {
    $.post(
      '../ajax/admin/selectServiceForName.php',
      {
        name_service: $(this).val()
      },
      function (data, status) {
        if (status == 'success') {
          let parse_data = JSON.parse(data)
          if (parse_data.value) {
            vm.data_services = parse_data.data_services
          } else {
            vm.data_services = []
          }
        }
      }
    )
  })
})
