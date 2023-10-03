
$(document).ready(function () {

    $('#register_new_book').click(function () {
        let k1 = new dashboard_page_cards().register_new_book_div();
        $('body').append(k1);
    });
    $('#return_book').click(function () {
        let k1 = new dashboard_page_cards().return_button_card();
        let floating_k1 = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater(k1[0]);
        $('body').append(floating_k1);
        $(k1[1]).click(function () {
            $(floating_k1).remove();
        });
    });
    $('#user_management').click(function () {
        let k1 = new dashboard_page_cards().user_search_and_add_card();
        let floating_k1 = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater([k1[0]]);
        $('body').append(floating_k1);
        $(k1[1]).click(function () {
            $(floating_k1).remove();
        });
    });
});

$(document).ready(function () {
    new dashboard_page_API_calls().refresh_book_list(10, 0, "all");

    // Filters Secction
    let filter_elem = $('#filter_tags');
    let k1 = new dashboard_page_API_calls().get_filter_tags().then(function (response) {
        $(filter_elem).attr('data-tags_selected_array', '[]')
        // console.log(response);
        let filters = response['options'];
        let len_of_options = filters.length;
        for (let i = 0; i < len_of_options; i++) {
            let option_div = document.createElement('div');
            $(option_div).addClass('cursor-pointer h-11 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg m-2 cursor-pointer shadow-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600');
            $(option_div).attr('data-option_value', filters[i]);
            $(option_div).text(filters[i]);
            $(filter_elem).append(option_div);

            $(option_div).click(function () {
                // First add border and color it green toggle.
                // Second as it inside the data-tags_selected_array, remove it from the array(If it is present).
                // Third, if it is not present in the array, add it to the array.

                if ($(this).attr('data-selected') == 'Yes') {
                    $(this).removeClass('border-2 border-green-500');
                    $(this).attr('data-selected', 'No');
                    let tags_selected_array = JSON.parse($(filter_elem).attr('data-tags_selected_array'));
                    let index = tags_selected_array.indexOf($(this).attr('data-option_value'));
                    if (index > -1) {
                        tags_selected_array.splice(index, 1);
                    }
                    $(filter_elem).attr('data-tags_selected_array', JSON.stringify(tags_selected_array));
                } else {
                    $(this).addClass('border-2 border-green-500');
                    $(this).attr('data-selected', 'Yes');
                    let tags_selected_array = JSON.parse($(filter_elem).attr('data-tags_selected_array'));
                    tags_selected_array.push($(this).attr('data-option_value'));
                    $(filter_elem).attr('data-tags_selected_array', JSON.stringify(tags_selected_array));
                }
                if ($(filter_elem).attr('data-tags_selected_array') == '[]') {
                    $('#books_box').empty();
                    new dashboard_page_API_calls().refresh_book_list(10, 0, "all");
                } else {
                    $('#books_box').empty();
                    new dashboard_page_API_calls().refresh_book_list_special(
                        50,
                        0,
                        {
                            "tags": JSON.parse($(filter_elem).attr('data-tags_selected_array')),
                            "generic": "A",
                            "search_string": "",
                            "status": "Available",
                            "time": "asc"
                        }
                    )
                }
                $(filter_elem).change();

            })




        }


    });

    $(filter_elem).change(function () {
        if ($(this).attr('data-tags_selected_array') != '[]') {
            $('#cleaner').addClass('border-red-500 border-t-2 border-b-2');
        } else {
            $('#cleaner').removeClass('border-red-500 border-2 border-t-2 border-b-2');
        }
    });
    $('#cleaner').click(function () {
        $(filter_elem).attr('data-tags_selected_array', '[]');
        // For each of the options, remove the border and the data-selected attribute.
        $(filter_elem).children().each(function () {
            $(this).removeClass('border-2 border-green-500');
            $(this).attr('data-selected', 'No');
        });
        $('#books_box').empty();
        new dashboard_page_API_calls().refresh_book_list(10, 0, "all");
        $('#cleaner').removeClass('border-red-500 border-2 border-t-2 border-b-2');
    });

    $('#search_bar').on('input', async function (e) {
        //   Console and log the input.
        console.log($(this).val());
        //   Make an API call to get the list of users. 
        if ($(this).val().length > 2) {
            $('#books_box').empty();
            new dashboard_page_API_calls().refresh_book_list_special(
                50,
                0,
                {
                    "tags": JSON.parse($(filter_elem).attr('data-tags_selected_array')),
                    "generic": "A",
                    "search_string": $(this).val(),
                    "status": "Available",
                    "time": "asc"
                }
            )

            return;
        } else {


            new dashboard_page_API_calls().refresh_book_list(10, 0, "all");
        }
    });
    // End of Filters Section


    // Start of return book scanner section

    $('#scanner').click(function () {
        // Request for permission to use the camera on the device.
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ video: true })
                .then(function (stream) {

                    // Your code when camera permission is granted
                    let scanner_div = new GENERIC_META_CALL().Generic_div(
                        'w-full bg-gray-200 shadow-lg rounded-lg',
                        ''
                    )
                    $(scanner_div).attr('id', 'scanner_div');
                    let cancel_button = new GENERIC_META_CALL().Generic_button(
                        "p-2 text-gray-400 hover:text-black w-full text-right font-bold text-sm rounded  focus:outline-none focus:shadow-outline",
                        "Cancel"
                    )
                    let cleaner = new GENERIC_META_CALL().Generic_div(
                        "p-2 text-purple-400 hover:text-black text-left font-bold text-sm rounded  focus:outline-none focus:shadow-outline cursor-pointer",
                        'Reset Book Scans'
                    );
                    let cancel_clean_holder = new GENERIC_META_CALL().Generic_div(
                        'w-full flex flex-row justify-between',
                        ''
                    )
                    $(cancel_clean_holder).append(cleaner);
                    $(cancel_clean_holder).append(cancel_button);

                    let stoper0 = new GENERIC_META_CALL().Generic_div('h-auto max-w-3xl ml-2', '');
                    let stoper1 = new GENERIC_META_CALL().Generic_div('max-h-96 max-w-max flex flex-wrap flex-row overflow-x-auto ', '');
                    let col_holder = new GENERIC_META_CALL().Generic_div('h-auto max-w-fit ml-2 bg-green-500 flex flex-col overflow-x-auto bg-white', '');
                    let float_actions = new dashboard_page_cards().scanner_action_card(stoper0, stoper1);
                    let stoper2 = new GENERIC_META_CALL().Generic_put_it_in_flex_col("flex flex-col", [cancel_clean_holder, scanner_div]);
                    let stoper3 = new GENERIC_META_CALL().Generic_div('h-auto w-auto', '');
                    let floater = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater([stoper2, float_actions[0]]);
                    $(stoper0).attr('data-div_type', 'user_card_placeholder');
                    $(stoper1).attr('data-div_type', 'book_card_placeholder').attr('data-unique_book_id_array', '[]')



                    $(col_holder).append(stoper1);
                    $(col_holder).append(stoper0);
                    $(floater).append(col_holder);
                    $(floater).children().removeClass('h-5/6').addClass('h-auto overflow-y-auto');
                    $('body').append(floater)
                    $(cancel_button).click(function () {
                        // Stop the scanner
                        html5QrCode.stop().then(ignore => {
                            // QR Code scanning is stopped.
                        }).catch(err => {
                            // Stop failed, handle it.
                        });
                        $(floater).remove();
                    });

                    $(cleaner).click(function () {
                        $(stoper1).empty();
                        $(stoper1).attr('data-unique_book_id_array', '[]');
                    });


                    let config = {
                        fps: 25,
                        qrbox: { width: 250, height: 250 },
                        rememberLastUsedCamera: true,
                        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                        // Only support camera scan type.
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                    };
                    let html5QrCode = new Html5Qrcode("scanner_div", config);
                    html5QrCode.start(

                        { facingMode: "environment" },
                        { fps: 45 },

                        onScanSuccess
                    ).catch(err => {
                        console.log(err);
                    }
                    );
                    function onScanSuccess(decodedText, decodedResult) {
                        // handle the scanned code as you like, for example:
                        let final_string = {}
                        // Split the decodedText by the delimiter '-'
                        let decodedText_array = decodedText.split('-');
                        if (decodedText_array[3] == "Book_card") {
                            console.log("Book card detected");
                            final_string['unique_book_id'] = decodedText_array[0];
                            final_string['Organization'] = decodedText_array[1];
                            final_string['Book_id'] = decodedText_array[2];
                            final_string['card_type'] = decodedText_array[3];

                        }
                        if (decodedText_array[3] == "Identity_card") {
                            final_string['User_id'] = decodedText_array[0];
                            final_string['Organization'] = decodedText_array[1];
                            final_string['email'] = decodedText_array[2];
                            final_string['card_type'] = decodedText_array[3];
                        }
                        console.log(decodedText_array);
                        console.log(final_string);
                        if (final_string['card_type'] == "Book_card" && Object.keys(final_string).includes('Book_id') && Object.keys(final_string).includes('Organization')) {
                            console.log("Book card detected");
                            let book_detail_getter = new GENERIC_APICALLS().GenericAPIJSON_CALL(
                                '/api/v1/admin/books/get_book_details',
                                'POST',
                                JSON.stringify({ "book_id": final_string['Book_id'], "organization": final_string['Organization'], "unique_book_id": final_string["unique_book_id"] })
                            ).then(function (response) {
                                let book_data = response['data'];
                                let unique_book_array = $(floater).find('[data-div_type="book_card_placeholder"]').attr('data-unique_book_id_array');
                                unique_book_array = JSON.parse(unique_book_array);
                                let index = unique_book_array.indexOf(final_string['unique_book_id']);
                                if (index > -1) {
                                    // Break the function.
                                    return;

                                }
                                unique_book_array.push(final_string['unique_book_id']);
                                $(floater).find('[data-div_type="book_card_placeholder"]').attr('data-unique_book_id_array', JSON.stringify(unique_book_array));
                                let book_card = new dashboard_page_cards().book_info_div_for_rent_card(book_data);
                                $(floater).find('[data-div_type="book_card_placeholder"]').append(book_card);
                            });
                        }
                        if (final_string['card_type'] == "Identity_card" && Object.keys(final_string).includes('User_id') && Object.keys(final_string).includes('Organization')) {
                            console.log("User card detected");
                            let user_detail_getter = new GENERIC_APICALLS().GenericAPIJSON_CALL(
                                '/api/v1/users/get_specific_user_data',
                                'POST',
                                JSON.stringify({ "id_number": final_string['User_id'], "organization": final_string['Organization'], "email": final_string['email'] })
                            ).then(function (response) {
                                console.log(response);
                                let user_data = response['data'];
                                let user_card = new dashboard_page_cards().user_info_div_for_rent_card(user_data);
                                $(user_card).attr('data-div_type', 'user_card_placeholder')
                                $(user_card).attr('data-user_data', JSON.stringify(user_data));
                                $(floater).find('[data-div_type="user_card_placeholder"]').replaceWith(user_card);
                            });
                        }
                    }

                    $(float_actions[1]).click(function () {
                        let user_data = JSON.parse($(floater).find('[data-div_type="user_card_placeholder"]').attr('data-user_data'))
                        let data_to_send = {
                            "organization": $('#current_user_organization').val(),
                            "user_id": user_data['sid'],
                            "noofdays": $(float_actions[0]).find('[name="noofdays"]').val(),
                            "unique_book_ids": JSON.parse($(floater).find('[data-div_type="book_card_placeholder"]').attr('data-unique_book_id_array')),
                        }
                        let url = "/api/v1/admin/books/scanner/action";
                        let method = "POST";
                        let data = JSON.stringify(data_to_send);
                        let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
                        $('body').append(status);
                        let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                            $(status).remove();
                            let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Rent/return action completed successfully", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                            $('body').append(status2);
                        });
                    });

                })
                .catch(function (error) {
                    return; // Return or handle the case when camera permission is denied or an error occurs
                });
        }

    });



    // End of return book scanner section

});

$(document).ready(function () {
    // Get meta data and add it in inside the meta_data_divs.
    let meta_data_get_url = "/api/v1/dashboard/simplemetadata/" + $('#current_user_organization').val();
    let meta_data_get_method = "GET";
    let meta_data_get_data = {};
    let API_call = new GENERIC_APICALLS().GenericAPICallv2(meta_data_get_url, meta_data_get_method, meta_data_get_data).then(function (response) {
        console.log(response);
        let meta_data = response['data'];
        let user_metadata = meta_data[0];
        let book_metadata = meta_data[1];
        let overdue_data = meta_data[2];
        console.log(user_metadata);
        console.log(book_metadata);
        // statistics_total_books , statistics_total_users , statistics_total_borrowed_books , statistics_number_of_books_overdue , statistics_total_penality_due_to_late_return , statistics_total_amount_paid_by_users

        $('#statistics_total_books').text(book_metadata['books_total_number_of_books_registered']);
        $('#statistics_total_users').text(user_metadata['user_total_users']);
        $('#statistics_total_borrowed_books').text(book_metadata['books_noofcopies_rented_currently']);
        $('#statistics_number_of_books_overdue').text(overdue_data['total_number_of_overdue_books']).attr('data-overdue_books', JSON.stringify(overdue_data['card_data']));
        $('#statistics_total_penality_due_to_late_return').text(overdue_data['total_penality']);
        $('#statistics_total_amount_paid_by_users').text(user_metadata['user_total_amount_paid']);




    });
});




class dashboard_page_cards {
    register_new_book_div() {
        let top_label = new GENERIC_META_CALL().Generic_div(
            "text-xl font-semibold text-violet-500 border-b-2 border-gray-200 p-2 w-full dark:text-white dark:border-b dark:border-gray-600 dark:bg-gray-700 flex flex-row justify-between",
            "Add new book to library"
        )
        let form = document.createElement('form');
        form.setAttribute('id', 'register_new_book_form');
        form.setAttribute('class', 'w-full max-w-lg shadow-lg p-2 pb-0');
        form.setAttribute('action', '/api/v1/book/register');
        form.setAttribute('method', 'POST');
        form.setAttribute('enctype', 'multipart/form-data');
        form.setAttribute('autocomplete', 'off');
        // ['title', 'author', 'isbn', 'genre', 'description', 'tags', 'noofcopies']
        let input_css_class = "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none"
        let label_css_class = "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700"
        let title_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Title"
        );
        let title_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "title",
            ""
        )
        $(title_input).attr('required', 'true').attr('minlength', '3').attr('name', 'title')
        let author_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 ",
            "Author"
        );

        let author_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "author",
            ""
        )
        $(author_input).attr('required', 'true').attr('minlength', '3').attr('name', 'author')
        let isbn_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "ISBN"
        );
        let isbn_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "isbn (optional)",
            ""
        )
        $(isbn_input).attr('name', 'isbn')
        let genre_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 hidden",
            "Genre"
        );
        let genre_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 hidden outline-none",
            "genre (optional)",
            ""
        )
        $(genre_input).attr('name', 'genre')
        new dashboard_page_cards().extra_option_div_binder('/api/v1/admin/get_book_tags?book_tag_parameter=genre', genre_input);
        let description_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Description"
        );
        let description_input = new GENERIC_META_CALL().Generic_textarea(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "description (optional)",
            ""
        )
        $(description_input).attr('name', 'description')
        let tags_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Tags"
        );
        let tags_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "tags (optional)",
            ""
        )
        $(tags_input).attr('name', 'tags')
        new dashboard_page_cards().extra_option_div_binder('/api/v1/admin/get_book_tags?book_tag_parameter=tags', tags_input);
        let noofcopies_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "No of copies"
        );
        let noofcopies_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "noofcopies",
            "1"
        )
        let organization_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
            "hidden",
            [$('#current_user_organization').val()],
        )
        $(organization_dropdown).attr('name', 'organization')

        $(noofcopies_input).attr('type', 'number').attr('min', '1').attr('max', '100').attr('name', 'noofcopies')
        let form_array = [
            title_label,
            title_input,
            author_label,
            author_input,
            noofcopies_label,
            noofcopies_input,
            tags_label,
            tags_input,
            description_label,
            description_input,
            isbn_label,
            isbn_input,
            organization_dropdown,
            genre_label,
            genre_input,


        ]

        for (let i = 0; i < form_array.length; i++) {
            $(form).append(form_array[i]);
        }
        let create_book_button = new GENERIC_META_CALL().Generic_button(
            "bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Create book"
        )
        let cancel_button = new GENERIC_META_CALL().Generic_button(
            "p-2 text-gray-400 hover:text-black font-bold text-sm rounded focus:outline-none focus:shadow-outline",
            "Cancel"
        )
        $(top_label).append(cancel_button);



        let appender_array = [
            top_label,
            form,
            create_book_button
        ]

        let r1 = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater(appender_array);

        $(cancel_button).click(function () {
            $(r1).remove();
        });

        $(create_book_button).click(function (e) {
            e.preventDefault();
            //    Step1: Validate the form

            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
            // Step2: Get the form data and convert it to JSON

            let form_data = new FormData(form);
            let form_data_json = {};
            console.log(form_data);
            for (let [key, value] of form_data.entries()) {
                form_data_json[key] = value;
            }
            // console.log(form_data_json);
            // Step3: Santize and send the data to the server
            if (form_data_json['isbn'] == "") {
                form_data_json['isbn'] = "000"
            }
            if (form_data_json['genre'] == "") {
                form_data_json['genre'] = "000"
            }
            if (form_data_json['description'] == "") {
                form_data_json['description'] = "000"
            }
            if (form_data_json['tags'] == "") {
                form_data_json['tags'] = "000"
            }
            console.log(form_data_json);

            let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing registration...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
            $('body').append(status);
            let url = "/api/v1/admin/books/register";
            let method = "POST";
            let data = JSON.stringify(form_data_json);
            let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                console.log(response);
                $(status).remove();
                status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Book registered successfully", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                $('body').append(status);
            });
        });
        return r1;

    }
    extra_option_div_binder(get_url, bind_input) {
        // On focus on bind_input call and append the extra_option_div_helper. On out of focus and not on the next div, remove the extra_option_div_helper.
        $(bind_input).focus(function () {
            if ($(bind_input).next().attr('data-options_div') == 'Yes') {
                return;
            }
            let add_dummy_div = document.createElement('div');
            $(bind_input).after(add_dummy_div);
            let extra_option_div = extra_option_div_helper(get_url, bind_input).then(function (response) {
                $(response).attr('data-options_div', 'Yes');
                $(bind_input).next().remove();
                $(bind_input).after(response);
            });
        });
        // If clicked on the body.
        $('body').click(function (e) {
            // And not clicked on the next div.
            if ($(bind_input).next().attr('data-options_div') == 'Yes' && !$(bind_input).next().is(':hover') && !$(bind_input).is(':focus')) {
                $(bind_input).next().remove();
            }
        });


        async function extra_option_div_helper(get_url, bind_input) {
            let wrapper_div = document.createElement('div');
            $(wrapper_div).addClass('w-full max-w-lg shadow-lg p-2 flex justify-evenly flex-wrap dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none');
            let all_options;
            let caller = await new GENERIC_APICALLS().GenericAPICallv2(get_url, "GET", {}).then(function (response) {
                console.log(response);
                all_options = response['options'];
            });
            let len_of_options = all_options.length;
            for (let i = 0; i < len_of_options; i++) {
                let option_div = document.createElement('div');
                $(option_div).addClass('cursor-pointer p-2 bg-gray-200 hover:bg-gray-300 rounded-lg m-2 cursor-pointer shadow-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600');
                $(option_div).attr('data-option_value', all_options[i]);
                $(option_div).text(all_options[i]);
                $(wrapper_div).append(option_div);
                // On click split the values of bind_input, remove spaces and convert them all into lowercase and put in an array. Then check if the option value is present in the array. If present, do nothing. If not present, add it to the array and join the array with spaces and put it in the bind_input.
                $(option_div).click(function () {
                    let option_value = $(this).attr('data-option_value');
                    let bind_input_value = $(bind_input).val();
                    let bind_input_value_array = bind_input_value.split(',');
                    let bind_input_value_array_len = bind_input_value_array.length;
                    let flag = 0;
                    for (let i = 0; i < bind_input_value_array_len; i++) {
                        if (bind_input_value_array[i].trim().toLowerCase() == option_value.trim().toLowerCase()) {
                            flag = 1;
                            break;
                        }
                    }
                    if (flag == 0) {
                        bind_input_value_array.push(option_value);
                        $(bind_input).val(bind_input_value_array.join(','));
                        // Remove the first and last comma if present
                        let bind_input_value = $(bind_input).val();
                        if (bind_input_value[0] == ',') {
                            $(bind_input).val(bind_input_value.slice(1));
                        }
                        if (bind_input_value[bind_input_value.length - 1] == ',') {
                            $(bind_input).val(bind_input_value.slice(0, bind_input_value.length - 1));
                        }

                    }
                }
                );
            }
            return wrapper_div;
        }
    }

    book_row_card(book_data) {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg",
            ""
        )
        let primary_card_div = new GENERIC_META_CALL().Generic_div(
            "flex flex-row justify-items-end text-black font-semibold p-2",
            ""
        )
        let book_title = new GENERIC_META_CALL().Generic_span(
            "pt-2",
            book_data['title']
        )
        let buttons_wrapper_div = new GENERIC_META_CALL().Generic_div(
            "flex flex-row bg-gray-200 p-2 float-right ml-auto justify-evenly mr-2",
            ""
        )
        let lend_button = new GENERIC_META_CALL().Generic_span(
            "text-base float-right ml-auto pr-3 border-r-2 border-gray-500 text-black hover:font-bold cursor-pointer",
            "Rent"
        )
        let edit_book = new GENERIC_META_CALL().Generic_span(
            "text-base float-right ml-auto pr-2 border-r-2 pl-3 border-gray-500 text-black hover:font-bold cursor-pointer",
            "Edit"
        )
        let delete_copy = new GENERIC_META_CALL().Generic_span(
            "text-base float-right ml-auto mr-2 pl-2 text-black hover:font-bold cursor-pointer",
            "Delete 📚"
        )

        $(buttons_wrapper_div).append(lend_button);
        $(buttons_wrapper_div).append(edit_book);
        $(buttons_wrapper_div).append(delete_copy);

        $(lend_button).click(function (e) {
            let lend_card = new dashboard_page_cards().rent_button_card(book_data);
            lend_card[0] = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater(lend_card[0]);
            $(lend_card[1]).click(function () {
                $(lend_card[0]).remove();
            });
            $('body').append(lend_card[0]);
        });
        $(edit_book).click(function (e) {
            let edit_card = new dashboard_page_cards().edit_details_card(book_data);
            edit_card[0] = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater(edit_card[0]);
            $(edit_card[1]).click(function () {
                $(edit_card[0]).remove();
            });
            $('body').append(edit_card[0]);
        });
        $(delete_copy).click(function (e) {
            let delete_card = new dashboard_page_cards().delete_book_copy_card(book_data);
            delete_card[0] = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater(delete_card[0]);
            $(delete_card[1]).click(function () {
                $(delete_card[0]).remove();
            });
            $('body').append(delete_card[0]);
        });


        let show_details_button = new GENERIC_META_CALL().Generic_div(
            "w-full text-right bg-gray-200 font-semibold  hover:text-green-600 text-green-500 cursor-pointer pl-2 pr-2 rounded-b-lg",
            "Show Details"
        )


        $(primary_card_div).append(book_title);
        $(primary_card_div).append(buttons_wrapper_div);
        $(wrapper_div).append(primary_card_div);
        $(wrapper_div).append(show_details_button);
        $(show_details_button).click(function () {
            let more_info_div = new dashboard_page_cards().book_info_div(book_data);
            $(show_details_button).replaceWith(more_info_div);
        });
        return wrapper_div;
    }

    rent_button_card(book_data) {
        let top_label = new GENERIC_META_CALL().Generic_div(
            "text-xl font-semibold text-violet-500 border-b-2 border-gray-200 p-2 w-full dark:text-white dark:border-b dark:border-gray-600 dark:bg-gray-700 flex flex-row justify-between",
            "Rent book"
        )
        let the_renting_form = document.createElement('form');
        let User_Name_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "User Name: "
        );
        let rent_button = new GENERIC_META_CALL().Generic_button(
            "bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Rent"
        )
        let extra_info_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 mt-2 border-gray-200 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let extra_info_div2 = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 mt-2 border-gray-200 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let book_data_info_card_for_rent_card = new dashboard_page_cards().book_info_div_for_rent_card(book_data);
        $(extra_info_div).append(book_data_info_card_for_rent_card);
        let User_Name_search_bar = new GENERIC_META_CALL().search_bar_dropdown(
            "max-h-56",
            "w-full shadow h-8 w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Enter User Name...",
            "bg-gray-100 pb-2"
        )
        let organization_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
            "hidden",
            [$('#current_user_organization').val()],
        )
        $(organization_dropdown).attr('name', 'organization')
        let unique_book_id_drodown_label = new GENERIC_META_CALL().Generic_label(
            "w-full text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Unique Book ID: "
        );
        let unique_book_id_dropdown;
        let book_ids_api_call = new GENERIC_APICALLS().GenericAPIJSON_CALL(
            '/api/v1/books/get_unique_book_ids',
            'POST',
            JSON.stringify({ "book_id": book_data['sid'], "organization": book_data['organization'] })
        ).then(function (response) {
            console.log(response);
            let unique_book_ids = response['data'];
            unique_book_id_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
                "w-full shadow appearance-none w-full mt-2 p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
                unique_book_ids,
            )
            $(unique_book_id_dropdown).attr('name', 'unique_book_id')
            $(the_renting_form).append(unique_book_id_drodown_label);
            $(the_renting_form).append(unique_book_id_dropdown);
        });
        $(User_Name_search_bar[1]).attr('required', 'true').attr('minlength', '3').attr('name', 'username')
        $(User_Name_search_bar[1]).on('input', async function (e) {
            //   Console and log the input.
            console.log($(this).val());
            //   Make an API call to get the list of users. 
            if ($(this).val().length < 2) {
                $(User_Name_search_bar[2]).empty();
                return;
            }
            let url = "/api/v1/users/get_user_list";
            let method = "POST";
            let data = {
                "search_string": $(this).val(),
                "limit": 10,
                "skip": 0,
                "organization": $(organization_dropdown).val()
            }
            data = JSON.stringify(data);
            let r1 = await new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data);
            console.log("The response is: ")
            console.log(r1);
            let options = r1['data'];

            for (let i = 0; i < options.length; i++) {
                $(User_Name_search_bar[2]).empty();
                let test_div = new GENERIC_META_CALL().Generic_div(
                    "w-full text-gray-700 text-sm font-bold mb-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 p-2 bg-gray-200 hover:bg-gray-300",
                    options[i]["username"]
                )
                $(test_div).attr('data-user_email', options[i]['email']).attr('data-user_name', options[i]['username']);
                $(test_div).click(function (e) {
                    // Transfer the username to the input box. And empty the options div.
                    $(User_Name_search_bar[1]).val($(this).attr('data-user_email')).attr('title', $(this).attr('data-user_name')).attr('data-all_info', JSON.stringify(options[i]));
                    let user_info_div = new dashboard_page_cards().user_info_div_for_rent_card(options[i]);
                    $(user_info_div).attr('data-div_type', 'user_info_div_for_rent_card')
                    $(extra_info_div2).empty();
                    $(extra_info_div2).append(user_info_div);
                    $(User_Name_search_bar[2]).empty();
                });
                $(User_Name_search_bar[2]).append(test_div);
            }
        });
        let Number_of_days_label = new GENERIC_META_CALL().Generic_label(
            "w-full text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of days: "
        );
        let Number_of_days_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Number of days",
            ""
        )
        $(Number_of_days_input).attr('type', 'number').attr('min', '1').attr('max', '100').attr('name', 'noofdays').val('7').attr('required', 'true');

        let cancel_button = new GENERIC_META_CALL().Generic_button(
            "p-2 text-gray-400 hover:text-black font-bold text-sm rounded focus:outline-none focus:shadow-outline",
            "Cancel"
        )
        $(top_label).append(cancel_button);

        $(the_renting_form).append(User_Name_label);
        $(the_renting_form).append(User_Name_search_bar[0]);
        $(the_renting_form).append(Number_of_days_label);
        $(the_renting_form).append(Number_of_days_input);
        $(the_renting_form).append(organization_dropdown);
        let the_array = [
            top_label,
            // User_Name_label,
            // User_Name_search_bar[0],
            // Number_of_days_label,
            // Number_of_days_input,
            the_renting_form,
            rent_button,
            extra_info_div,
            extra_info_div2
        ]

        $(rent_button).click(function () {
            console.log("Rent button clicked");
            if ($(unique_book_id_dropdown).val() == null) {
                let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Please select a unique book id", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 1000)
                $('body').append(status2);
                return;
            }
            if (the_renting_form.reportValidity()) {
                let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing rent...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
                $('body').append(status);
                let user_data = JSON.parse($(User_Name_search_bar[1]).attr('data-all_info'));
                let form_data = {
                    "user_id": user_data['sid'],
                    "unique_book_id": $(unique_book_id_dropdown).val(),
                    // "user_email": $(User_Name_search_bar[1]).val(),
                    "noofdays": $(Number_of_days_input).val(),
                    "organization": $(organization_dropdown).val()
                }
                console.log(form_data);
                let url = "/api/v1/admin/books/rent";
                let method = "POST";
                let data = JSON.stringify(form_data);
                let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully rented book", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                    $('body').append(status2);
                    $(cancel_button).click()
                }).catch(function (error) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in renting book", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 1000)
                    $('body').append(status2);
                });
            }


        });


        return [the_array, cancel_button];
    }

    return_button_card() {
        let top_label = new GENERIC_META_CALL().Generic_div(
            "text-xl font-semibold text-violet-500 border-b-2 border-gray-200 p-2 w-full dark:text-white dark:border-b dark:border-gray-600 dark:bg-gray-700 flex flex-row justify-between",
            "Return book"
        )
        let the_renting_form = document.createElement('form');
        let User_Name_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "User Name: "
        );
        let return_button = new GENERIC_META_CALL().Generic_button(
            "bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Return"
        )
        let extra_info_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 mt-2 border-gray-200 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let extra_info_div2 = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 mt-2 border-gray-200 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let User_Name_search_bar = new GENERIC_META_CALL().search_bar_dropdown(
            "max-h-56",
            "w-full shadow h-8 w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Enter User Name...",
            "bg-gray-100 pb-2"
        )

        let organization_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
            "hidden",
            [$('#current_user_organization').val()],
        )
        $(organization_dropdown).attr('name', 'organization')
        let unique_book_id_drodown_label = new GENERIC_META_CALL().Generic_label(
            "w-full text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Unique Book ID: "
        );

        let unique_book_id_dropdown;

        $(User_Name_search_bar[1]).attr('required', 'true').attr('minlength', '3').attr('name', 'username')
        $(User_Name_search_bar[1]).on('input', async function (e) {
            //   Console and log the input.
            console.log($(this).val());
            //   Make an API call to get the list of users. 
            if ($(this).val().length < 2) {
                $(User_Name_search_bar[2]).empty();
                return;
            }
            let url = "/api/v1/users/get_user_list";
            let method = "POST";
            let data = {
                "search_string": $(this).val(),
                "limit": 10,
                "skip": 0,
                "organization": $(organization_dropdown).val()
            }
            data = JSON.stringify(data);
            let r1 = await new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data);
            console.log("The response is: ")
            console.log(r1);
            let options = r1['data'];

            for (let i = 0; i < options.length; i++) {
                $(User_Name_search_bar[2]).empty();
                let test_div = new GENERIC_META_CALL().Generic_div(
                    "w-full text-gray-700 text-sm font-bold mb-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 p-2 bg-gray-200 hover:bg-gray-300",
                    options[i]["username"]
                )
                $(test_div).attr('data-user_email', options[i]['email']).attr('data-user_name', options[i]['username']);
                $(test_div).click(function (e) {
                    // Transfer the username to the input box. And empty the options div.
                    $(User_Name_search_bar[1]).val($(this).attr('data-user_email')).attr('title', $(this).attr('data-user_name')).attr('data-all_info', JSON.stringify(options[i]));
                    let user_info_div = new dashboard_page_cards().user_info_div_for_rent_card(options[i]);
                    $(user_info_div).attr('data-div_type', 'user_info_div_for_rent_card')
                    $(extra_info_div2).empty();
                    $(extra_info_div2).append(user_info_div);
                    $(User_Name_search_bar[2]).empty();


                    let book_ids_api_call = new GENERIC_APICALLS().GenericAPIJSON_CALL(
                        '/api/v1/admin/books/returns/get_unique_book_ids',
                        'POST',
                        JSON.stringify({ "user_id": options[i]['sid'], "organization": $(organization_dropdown).val() })
                    ).then(function (response) {
                        console.log(response);
                        let unique_book_ids = response['data'];
                        unique_book_id_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
                            "w-full shadow appearance-none w-full mt-2 p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
                            unique_book_ids,
                        )
                        // Remove existing dropdown with unique book ids.
                        $(the_renting_form).find('select[name="unique_book_id"]').remove();
                        $(unique_book_id_dropdown).attr('name', 'unique_book_id')
                        $(the_renting_form).append(unique_book_id_drodown_label);
                        $(the_renting_form).append(unique_book_id_dropdown);
                    });
                });
                $(User_Name_search_bar[2]).append(test_div);
            }
        });


        let cancel_button = new GENERIC_META_CALL().Generic_button(
            "p-2 text-gray-400 hover:text-black font-bold text-sm rounded focus:outline-none focus:shadow-outline",
            "Cancel"
        )
        $(top_label).append(cancel_button);
        $(the_renting_form).append(User_Name_label);
        $(the_renting_form).append(User_Name_search_bar[0]);

        $(the_renting_form).append(organization_dropdown);
        let the_array = [
            top_label,
            // User_Name_label,
            // User_Name_search_bar[0],
            // Number_of_days_label,
            // Number_of_days_input,
            the_renting_form,
            return_button,
            extra_info_div,
            extra_info_div2
        ]

        $(return_button).click(function () {
            console.log("Rent button clicked");
            if ($(unique_book_id_dropdown).val() == null) {
                let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Please select a unique book id", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 1000)
                $('body').append(status2);
                return;
            }
            if (the_renting_form.reportValidity()) {
                let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing rent...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
                $('body').append(status);
                let user_data = JSON.parse($(User_Name_search_bar[1]).attr('data-all_info'));
                let form_data = {
                    "user_id": user_data['sid'],
                    "unique_book_id": $(unique_book_id_dropdown).val(),
                    "organization": $(organization_dropdown).val()
                }
                console.log(form_data);
                let url = "/api/v1/admin/return_book";
                let method = "POST";
                let data = JSON.stringify(form_data);
                let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully returned book", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                    $('body').append(status2);
                    $(cancel_button).click()
                }).catch(function (error) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in returning book", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 1000)
                    $('body').append(status2);
                });
            }


        });
        return [the_array, cancel_button];
    }
    book_info_div(book_data) {
        function more_info_div(book_data) {
            let wrapper_div = new GENERIC_META_CALL().Generic_div(
                "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
                ""
            )
            let Book_description = new GENERIC_META_CALL().Generic_div(
                "w-full p-2 bg-gray-300 text-black font-semibold",
                book_data["description"]
            )
            let Book_tags = new GENERIC_META_CALL().Generic_div(
                "w-full p-2 mt-1 text-black  bg-gray-300 text-black font-semibold",
                "Book Tags: "
            )
            let Book_tags_array = book_data["tags"]
            for (let i = 0; i < Book_tags_array.length; i++) {
                let Book_tag = new GENERIC_META_CALL().Generic_span(
                    "bg-gray-200 text-black font-semibold p-2 pt-1 pb-1 m-1 rounded-lg",
                    Book_tags_array[i]
                )
                $(Book_tags).append(Book_tag);
            }
            let Book_author_label = new GENERIC_META_CALL().Generic_label(
                "bg-gray-200 text-black font-semibold p-2 bg-gray-300 mb-1 ",
                "Author: " + book_data['author']
            );
            let Total_no_of_copies_label = new GENERIC_META_CALL().Generic_label(
                "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
                "Total no of copies: "
            );
            let Total_no_of_copies_value = new GENERIC_META_CALL().Generic_span(
                "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
                book_data['noofcopies']
            );
            let Available_copies_label = new GENERIC_META_CALL().Generic_label(
                "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
                "Available copies: "
            );
            let Available_copies_value = new GENERIC_META_CALL().Generic_span(
                "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
                book_data['noofcopies_available_currently']
            );
            let rented_copies_label = new GENERIC_META_CALL().Generic_label(
                "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
                "Rented copies: "
            );
            let rented_copies_value = new GENERIC_META_CALL().Generic_span(
                "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
                book_data['noofcopies_rented_currently']
            );
            let show_rented_copies_details_button = new GENERIC_META_CALL().Generic_div(
                "w-full text-right bg-gray-200 font-semibold  hover:text-green-600 text-green-500 cursor-pointer pl-2 pr-2 rounded-b-lg",
                "Show Rented Copies Details"
            )

            $(wrapper_div).append(Book_author_label);
            $(wrapper_div).append(Book_description)
            $(wrapper_div).append(Book_tags)
            $(wrapper_div).append(Total_no_of_copies_label);
            $(wrapper_div).append(Total_no_of_copies_value);
            $(wrapper_div).append(Available_copies_label);
            $(wrapper_div).append(Available_copies_value);
            $(wrapper_div).append(rented_copies_label);
            $(wrapper_div).append(rented_copies_value);
            $(wrapper_div).append(show_rented_copies_details_button);

            return wrapper_div;
        }
        return more_info_div(book_data);

    }
    user_info_div_for_rent_card(user_data) {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let name_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Name: "
        );
        let name_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data['username']
        );
        let Number_of_books_rented_currently = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of books rented currently: "
        );
        let Number_of_books_rented_currently_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"][$('#current_user_organization').val()]['Number_of_books_rented_currently']
        );
        let Number_of_books_returned_successfully = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of books returned successfully: "
        );
        let Number_of_books_returned_successfully_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"][$('#current_user_organization').val()]['Number_of_books_returned']
        );
        let Number_of_times_overdue = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of times overdue: "
        );
        let Number_of_times_overdue_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"][$('#current_user_organization').val()]['Number_of_times_overdue']
        );
        let Fine_amount_yet_to_be_paid = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Fine amount yet to be paid: "
        );
        let Fine_amount_yet_to_be_paid_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"][$('#current_user_organization').val()]['Total_fine_amount']
        );

        $(wrapper_div).append(name_label);
        $(wrapper_div).append(name_value);
        $(wrapper_div).append(Number_of_books_rented_currently);
        $(wrapper_div).append(Number_of_books_rented_currently_value);
        $(wrapper_div).append(Number_of_books_returned_successfully);
        $(wrapper_div).append(Number_of_books_returned_successfully_value);
        $(wrapper_div).append(Number_of_times_overdue);
        $(wrapper_div).append(Number_of_times_overdue_value);
        $(wrapper_div).append(Fine_amount_yet_to_be_paid);
        $(wrapper_div).append(Fine_amount_yet_to_be_paid_value);
        return wrapper_div;

    }
    book_info_div_for_rent_card(book_data) {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let book_title_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book title: "
        );
        let book_title_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            book_data['title']
        );
        let book_author_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book author: "
        );
        let book_author_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            book_data['author']
        );
        let Book_tags = new GENERIC_META_CALL().Generic_div(
            "w-full p-2 mt-1 text-black  bg-gray-300 text-black font-semibold flex flex-wrap",
            " "
        )
        let Book_tags_array = book_data["tags"]
        for (let i = 0; i < Book_tags_array.length; i++) {
            let Book_tag = new GENERIC_META_CALL().Generic_span(
                "bg-gray-200 text-black font-semibold p-2 pt-1 pb-1 m-1 rounded-lg",
                Book_tags_array[i]
            )
            $(Book_tags).append(Book_tag);
        }
        $(wrapper_div).append(book_title_label);
        $(wrapper_div).append(book_title_value);
        $(wrapper_div).append(book_author_label);
        $(wrapper_div).append(book_author_value);
        $(wrapper_div).append(Book_tags);
        return wrapper_div;
    }
    book_info_card_scanner(book_data) {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let book_title_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book title: "
        );
        let book_title_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            book_data['title']
        );
        let book_author_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book author: "
        );
        let book_author_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            book_data['author']
        );
        let Book_tags = new GENERIC_META_CALL().Generic_div(
            "w-full p-2 mt-1 text-black  bg-gray-300 text-black font-semibold flex flex-wrap",
            " "
        )
        let Book_tags_array = book_data["tags"]
        for (let i = 0; i < Book_tags_array.length; i++) {
            let Book_tag = new GENERIC_META_CALL().Generic_span(
                "bg-gray-200 text-black font-semibold p-2 pt-1 pb-1 m-1 rounded-lg",
                Book_tags_array[i]
            )
            $(Book_tags).append(Book_tag);
        }

        let number_of_times_book_has_been_rented_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of times book has been rented: "
        );
        let number_of_times_book_has_been_rented_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            book_data['nooftimesrented']
        );

        $(wrapper_div).append(book_title_label);
        $(wrapper_div).append(book_title_value);
        $(wrapper_div).append(book_author_label);
        $(wrapper_div).append(book_author_value);
        $(wrapper_div).append(Book_tags);
        return wrapper_div;
    }
    scanner_action_card(book_data, user_data) {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let number_of_days_to_be_rented_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of days to be rented: "
        );
        let number_of_days_to_be_rented_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Number of days",
            7
        )
        number_of_days_to_be_rented_input.setAttribute('type', 'number');
        number_of_days_to_be_rented_input.setAttribute('min', '1');
        number_of_days_to_be_rented_input.setAttribute('name', 'noofdays');

        let rent_button = new GENERIC_META_CALL().Generic_button(
            "bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Act upon books and scanned user"
        )
        let return_button = new GENERIC_META_CALL().Generic_button(
            "bg-green-500 mt-2 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Return"
        )

        $(wrapper_div).append(number_of_days_to_be_rented_label);
        $(wrapper_div).append(number_of_days_to_be_rented_input);
        $(wrapper_div).append(rent_button);
        // $(wrapper_div).append(return_button);

        return [wrapper_div, rent_button, return_button];
    }
    edit_details_card(book_data) {
        console.log(book_data);
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let big_label = new GENERIC_META_CALL().Generic_div(
            "text-xl font-semibold text-violet-500 border-b-2 border-gray-200 p-2 w-full dark:text-white dark:border-b dark:border-gray-600 dark:bg-gray-700 flex flex-row justify-between",
            "Edit book details"
        )
        let cancel_button = new GENERIC_META_CALL().Generic_button(
            "p-2 text-gray-400 hover:text-black font-bold text-sm rounded focus:outline-none focus:shadow-outline",
            "Cancel"
        );
        $(big_label).append(cancel_button);
        let edit_book_form = document.createElement('form');
        let book_title_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book title: "
        );
        let book_title_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Book title",
            new GENERIC_META_CALL().Generic_space_splitter_and_join(book_data['title'], 1)
        )
        let add_more_copies_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Add more copies:"
        );
        let add_more_copies_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Add more copies",
            book_data['noofcopies']
        )
        add_more_copies_input.setAttribute('type', 'number');
        add_more_copies_input.setAttribute('min', book_data['noofcopies']);
        add_more_copies_input.setAttribute('name', 'noofcopies');
        book_title_input.setAttribute('type', 'text');
        book_title_input.setAttribute('required', 'true');
        book_title_input.setAttribute('minlength', '3');
        book_title_input.setAttribute('name', 'title');
        let book_author_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book author: "
        );
        let book_author_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Book author",
            book_data['author']
        )
        book_author_input.setAttribute('type', 'text');
        book_author_input.setAttribute('required', 'true');
        book_author_input.setAttribute('minlength', '3');
        book_author_input.setAttribute('name', 'author');
        let book_description_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book description: "
        );
        let book_description_input = new GENERIC_META_CALL().Generic_textarea(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Book description",
        );
        $(book_description_input).text(book_data['description']);
        book_description_input.setAttribute('required', 'true');
        book_description_input.setAttribute('minlength', '3');
        book_description_input.setAttribute('name', 'description');
        let book_tags_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Book tags: "
        );
        let book_tags_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Book tags",
            book_data['tags'].join(',')
        )
        new dashboard_page_cards().extra_option_div_binder('/api/v1/admin/get_book_tags?book_tag_parameter=tags', book_tags_input);
        let isbn_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "ISBN: "
        );
        let isbn_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "ISBN",
            book_data['isbn']
        )
        book_tags_input.setAttribute('type', 'text');
        book_tags_input.setAttribute('required', 'true');
        book_tags_input.setAttribute('minlength', '3');
        book_tags_input.setAttribute('name', 'tags');

        $(edit_book_form).append(book_title_label);
        $(edit_book_form).append(book_title_input);
        $(edit_book_form).append(book_author_label);
        $(edit_book_form).append(book_author_input);
        $(edit_book_form).append(book_description_label);
        $(edit_book_form).append(book_description_input);
        $(edit_book_form).append(book_tags_label);
        $(edit_book_form).append(book_tags_input);
        $(edit_book_form).append(isbn_label);
        $(edit_book_form).append(isbn_input);
        $(edit_book_form).append(add_more_copies_label);
        $(edit_book_form).append(add_more_copies_input);
        $(wrapper_div).append(big_label);
        $(wrapper_div).append(edit_book_form);

        let update_button = new GENERIC_META_CALL().Generic_button(
            "bg-green-500 mt-2 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Update"
        );
        $(wrapper_div).append(update_button);
        $(update_button).click(function () {
            if (edit_book_form.reportValidity()) {
                let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing update...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
                $('body').append(status);
                let form_data = {
                    "title": $(book_title_input).val(),
                    "author": $(book_author_input).val(),
                    "description": $(book_description_input).val(),
                    "tags": $(book_tags_input).val(),
                    "isbn": $(isbn_input).val(),
                    "noofcopies": $(add_more_copies_input).val(),
                    "book_id": book_data['sid'],
                    "organization": $('#current_user_organization').val()
                }
                let url = "/api/v1/admin/books/edit_book";
                let method = "POST";
                console.log(form_data);
                let data = JSON.stringify(form_data);
                let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully updated book", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                    $('body').append(status2);
                    $(cancel_button).click()
                }).catch(function (error) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in updating book", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 1000)
                    $('body').append(status2);
                });

            }
        });

        return [[wrapper_div], cancel_button, update_button];
    }
    delete_book_copy_card(book_data) {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 border-gray-200 mb-2 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let big_label = new GENERIC_META_CALL().Generic_div(
            "text-xl font-semibold text-red-500 border-b-2 border-gray-200 p-2 w-full dark:text-white dark:border-b dark:border-gray-600 dark:bg-gray-700 flex flex-row justify-between",
            "Delete book copy"
        )
        let cancel_button = new GENERIC_META_CALL().Generic_button(
            "p-2 text-gray-400 hover:text-black font-bold text-sm rounded focus:outline-none focus:shadow-outline",
            "Cancel"
        );
        $(big_label).append(cancel_button);
        let delete_book_form = document.createElement('form');
        let book_title_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left",
            "Book title: "
        );
        let book_title_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left",
            book_data['title'].split(' ').slice(1).join(' ')
        );
        let unique_book_array;
        let unique_book_id_dropdown;
        let url = "/api/v1/books/get_unique_book_ids"
        let method = "POST"
        let data = {
            "book_id": book_data['sid'],
            "organization": $('#current_user_organization').val()
        }
        let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, JSON.stringify(data)).then(function (response) {
            console.log(response);
            unique_book_array = response['data']
            unique_book_id_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
                "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
                unique_book_array
            );
            $(unique_book_id_dropdown).attr('name', 'unique_book_id');
            $(delete_book_form).append(book_title_label);
            $(delete_book_form).append(book_title_value);
            $(delete_book_form).append(unique_book_id_label);
            $(delete_book_form).append(unique_book_id_dropdown);
            $(delete_book_form).append(delete_button);
            $(wrapper_div).append(big_label);
            $(wrapper_div).append(delete_book_form);
        })
        let delete_button = new GENERIC_META_CALL().Generic_button(
            "bg-red-500 mt-2 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Delete"
        );
        let unique_book_id_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left",
            "Unique book id: "
        );

        $(delete_button).click(function (e) {
            e.preventDefault();
            let data = {
                "Unique_Book_ID": $(unique_book_id_dropdown).val(),
                "Organization": $('#current_user_organization').val()
            }
            let url = "/api/v1/admin/books/delete_unique_book"
            let method = "POST"
            let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, JSON.stringify(data)).then(function (response) {
                console.log(response);
                let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully deleted book", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                $('body').append(status);
                $(cancel_button).click()
            }).catch(function (error) {
                let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in deleting book", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 3000)
                $('body').append(status);
            })
        })




        return [[wrapper_div], cancel_button, delete_button];
    }
    user_search_and_add_card() {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            'w-full h-full flex flex-col shadow-md border-b-2 border-gray-200 shadow-lg bg-gray-200',
            ''
        )
        let top_tab_bar = new GENERIC_META_CALL().Generic_div(
            'w-full flex flex-row justify-start border-b-2 pb-2 bg-gray-100',
            ''
        )
        let new_user_button = new GENERIC_META_CALL().Generic_button(
            'bg-green-500 rounded-b-md shadow-lg hover:bg-green-700 text-white font-bold p-2  focus:outline-none focus:shadow-outline',
            'Add new user'
        )
        let penality_payment_button = new GENERIC_META_CALL().Generic_button(
            'bg-blue-500 shadow-lg rounded-b-md hover:bg-blue-700 text-white font-bold ml-2 p-2  focus:outline-none focus:shadow-outline',
            'Make payment'
        )
        let cancel_button = new GENERIC_META_CALL().Generic_button(
            "p-2 text-gray-400 hover:text-black text-right font-bold text-sm rounded ml-auto text-right  focus:outline-none focus:shadow-outline",
            "Cancel"
        )
        let content_box = new GENERIC_META_CALL().Generic_div(
            'w-full flex flex-col justify-start',
            ''
        )

        $(new_user_button).click(function () {
            let k1 = new dashboard_page_cards().new_user_form_card();
            $(content_box).empty();
            $(content_box).append(k1[0]);
        })
        $(penality_payment_button).click(function () {
            let k1 = new dashboard_page_cards().penality_payment_card();
            $(content_box).empty();
            $(content_box).append(k1[0]);
        })


        $(top_tab_bar).append(new_user_button);
        $(top_tab_bar).append(penality_payment_button);
        $(top_tab_bar).append(cancel_button);
        $(wrapper_div).append(top_tab_bar);
        $(wrapper_div).append(content_box);
        $(new_user_button).click();
        return [wrapper_div, cancel_button];
    }
    new_user_form_card() {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            'w-full h-full p-2 flex flex-col shadow-md border-b-2 border-gray-200 shadow-lg bg-gray-200',
            ''
        )
        let new_user_form = document.createElement('form');
        let user_name_label = new GENERIC_META_CALL().Generic_label(
            'block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left',
            'User name: '
        )
        let user_name_input = new GENERIC_META_CALL().Generic_input(
            'w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none',
            'User name',
            ''
        )
        $(user_name_input).attr('name', 'username').attr('required', 'true').attr('minlength', '3').attr('type', 'text');
        let user_email_label = new GENERIC_META_CALL().Generic_label(
            'block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left',
            'User email: '
        )
        let user_email_input = new GENERIC_META_CALL().Generic_input(
            'w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none',
            'User email',
            ''
        )
        $(user_email_input).attr('name', 'email').attr('required', 'true').attr('minlength', '3').attr('type', 'email');
        let user_id_number_label = new GENERIC_META_CALL().Generic_label(
            'block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left',
            'User id number: '
        )
        let user_id_number_input = new GENERIC_META_CALL().Generic_input(
            'w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none',
            'User id number:: (Optional)',
            ''
        )
        $(user_id_number_input).attr('name', 'id_number').attr('minlength', '3').attr('type', 'text');
        let user_phone_label = new GENERIC_META_CALL().Generic_label(
            'block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left',
            'User phone: (Optional) '
        )
        let user_phone_input = new GENERIC_META_CALL().Generic_input(
            'w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none',
            'User phone',
            ''
        )
        $(user_phone_input).attr('name', 'phone').attr('minlength', '3').attr('type', 'number');
        let description_label = new GENERIC_META_CALL().Generic_label(
            'block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left',
            'Description: (Optional) '
        )
        let description_input = new GENERIC_META_CALL().Generic_textarea(
            'w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none',
            'Description (Optional)',
        );
        $(description_input).attr('name', 'description').attr('minlength', '3');
        let user_type_label = new GENERIC_META_CALL().Generic_label(
            'block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 text-left',
            'User type: '
        )
        let user_type_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
            'w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none',
            ['Student', 'Faculty', 'Staff', 'Admin', 'Other']
        );
        $(user_type_dropdown).attr('name', 'user_type').attr('required', 'true');
        let create_user_button = new GENERIC_META_CALL().Generic_button(
            'w-full bg-green-500 mt-6 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline',
            'Create user'
        )
        $(new_user_form).append(user_name_label);
        $(new_user_form).append(user_name_input);
        $(new_user_form).append(user_email_label);
        $(new_user_form).append(user_email_input);
        $(new_user_form).append(user_id_number_label);
        $(new_user_form).append(user_id_number_input);
        $(new_user_form).append(user_phone_label);
        $(new_user_form).append(user_phone_input);
        $(new_user_form).append(description_label);
        $(new_user_form).append(description_input);
        $(new_user_form).append(user_type_label);
        $(new_user_form).append(user_type_dropdown);
        $(new_user_form).append(create_user_button);
        $(wrapper_div).append(new_user_form);

        $(create_user_button).click(function (e) {
            e.preventDefault();
            if (new_user_form.reportValidity()) {
                // If any part of the form is null or 0 or empty, then add 000 to it.
                for (let i = 0; i < $(new_user_form).find('input').length; i++) {
                    if ($(new_user_form).find('input')[i].value == '') {
                        $(new_user_form).find('input')[i].value = '000';
                    }
                }
                let data_to_send = {
                    "username": $(user_name_input).val(),
                    "email": $(user_email_input).val(),
                    "id_number": $(user_id_number_input).val(),
                    "phone_number": $(user_phone_input).val(),
                    "description": $(description_input).val(),
                    "role": $(user_type_dropdown).val(),
                    "organization": $('#current_user_organization').val()
                }
                // 'username', 'email','id_number','phone_number','description','organization','role'
                console.log(data_to_send);
                let url = "/api/v1/user/register_passwordless";
                let method = "POST";
                let data = JSON.stringify(data_to_send);
                let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                    console.log(response);
                    let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully created user", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                    $('body').append(status);
                    $(cancel_button).click();
                }).catch(function (error) {
                    console.log(error);
                    let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in creating user, Email or username already exists or you do not have permission", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 4000)
                    $('body').append(status);
                })
            }
        })



        return [wrapper_div, new_user_form];
    }
    penality_payment_card() {
        let wrapper_div = new GENERIC_META_CALL().Generic_div(
            'w-full h-full p-2 flex flex-col shadow-md border-b-2 border-gray-200 shadow-lg bg-gray-200',
            ''
        )
        let penality_payment_form = document.createElement('form');
        let User_Name_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "User Name: "
        );
        let extra_info_div = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 mt-2 border-gray-200 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let extra_info_div2 = new GENERIC_META_CALL().Generic_div(
            "w-full flex flex-col shadow-md border-b-2 mt-2 border-gray-200 shadow-lg bg-gray-200 p-2 ",
            ""
        )
        let User_Name_search_bar = new GENERIC_META_CALL().search_bar_dropdown(
            "max-h-56",
            "w-full shadow h-8 w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Enter User Name...",
            "bg-gray-100 pb-2"
        )
        let payment_value_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Payment value: "
        );
        let payment_value_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Payment value (Rs) ",
            ''
        )
        $(payment_value_input).attr('name', 'payment_value').attr('required', 'true').attr('minlength', '1').attr('min', '1').attr('type', 'number');

        let payment_mode_dropdown_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Payment mode: "
        );
        let payment_mode_dropdown = new GENERIC_META_CALL().normal_select_dropdown(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            ['Cash', 'UPI', 'Card', 'Other']
        )
        let payment_reference_number_label = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Payment reference number: "
        );
        let payment_reference_number_input = new GENERIC_META_CALL().Generic_input(
            "w-full shadow appearance-none w-full p-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 outline-none",
            "Payment reference number",
            ''
        )
        $(payment_reference_number_input).attr('name', 'payment_reference_number').attr('required', 'true').attr('minlength', '1').attr('min', '1').attr('type', 'text');
        let add_payment_button = new GENERIC_META_CALL().Generic_button(
            "w-full bg-green-500 mt-6 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
            "Add payment"
        )





        $(User_Name_search_bar[1]).attr('required', 'true').attr('minlength', '3').attr('name', 'username')
        $(User_Name_search_bar[1]).on('input', async function (e) {
            //   Console and log the input.
            console.log($(this).val());
            //   Make an API call to get the list of users. 
            if ($(this).val().length < 2) {
                $(User_Name_search_bar[2]).empty();
                return;
            }
            let url = "/api/v1/users/get_user_list";
            let method = "POST";
            let data = {
                "search_string": $(this).val(),
                "limit": 10,
                "skip": 0,
                "organization": $('#current_user_organization').val()
            }
            data = JSON.stringify(data);
            let r1 = await new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data);
            console.log("The response is: ")
            console.log(r1);
            let options = r1['data'];

            for (let i = 0; i < options.length; i++) {
                $(User_Name_search_bar[2]).empty();
                let test_div = new GENERIC_META_CALL().Generic_div(
                    "w-full text-gray-700 text-sm font-bold mb-2 dark:text-white dark:border-gray-600 dark:bg-gray-700 p-2 bg-gray-200 hover:bg-gray-300",
                    options[i]["username"]
                )
                $(test_div).attr('data-user_email', options[i]['email']).attr('data-user_name', options[i]['username']);
                $(test_div).click(function (e) {
                    // Transfer the username to the input box. And empty the options div.
                    $(User_Name_search_bar[1]).val($(this).attr('data-user_email')).attr('title', $(this).attr('data-user_name')).attr('data-all_info', JSON.stringify(options[i]));
                    let user_info_div = new dashboard_page_cards().user_info_div_for_rent_card(options[i]);
                    $(user_info_div).attr('data-div_type', 'user_info_div_for_rent_card')
                    $(extra_info_div).empty();
                    $(extra_info_div).append(user_info_div);
                    $(User_Name_search_bar[2]).empty();
                });
                $(User_Name_search_bar[2]).append(test_div);
            }
        });

        $(add_payment_button).click(function (e) {
            e.preventDefault();
            if (penality_payment_form.reportValidity()) {
                let data = {
                    "username": $(User_Name_search_bar[1]).val(),
                    "payment_value": $(payment_value_input).val(),
                    "payment_mode": $(payment_mode_dropdown).val(),
                    "payment_reference_number": $(payment_reference_number_input).val(),
                    "organization": $('#current_user_organization').val()
                }
                let url = "/api/v1/admin/users/admin_add_user_payment";
                let method = "POST";
                let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, JSON.stringify(data)).then(function (response) {
                    console.log(response);
                    let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully added payment", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                    $('body').append(status);
                    $(cancel_button).click();
                }).catch(function (error) {
                    console.log(error);
                    let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in adding payment", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 4000)
                    $('body').append(status);
                })
            }
        })



        $(penality_payment_form).append(User_Name_label);
        $(penality_payment_form).append(User_Name_search_bar[0]);
        $(penality_payment_form).append(payment_value_label);
        $(penality_payment_form).append(payment_value_input)
        $(penality_payment_form).append(payment_mode_dropdown_label);
        $(penality_payment_form).append(payment_mode_dropdown);
        $(penality_payment_form).append(payment_reference_number_label);
        $(penality_payment_form).append(payment_reference_number_input);
        $(penality_payment_form).append(add_payment_button);
        $(wrapper_div).append(penality_payment_form);
        $(wrapper_div).append(extra_info_div);
        return [wrapper_div, penality_payment_form];

    }
}
class dashboard_page_API_calls {
    async get_filter_tags() {
        let url = "/api/v1/admin/get_book_tags?book_tag_parameter=tags";
        let method = "GET";
        let data = {};
        let r1 = await new GENERIC_APICALLS().GenericAPICallv2(url, method, data);
        console.log(r1);
        return r1;
    }
    refresh_book_list(limit, skip, special_filter, empty_out = 1) {
        let url = "/api/v1/get_book_list";
        let method = "POST";
        let the_data = {
            "limit": limit,
            "skip": skip,
            "special_filter": special_filter,
            "organization": $('#current_user_organization').val()
        }
        let data = JSON.stringify(the_data);
        let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
            console.log(response);
            if (empty_out) {
                $('#books_box').empty();
            }
            let book_list = response['data'];
            let book_box = $('#books_box');
            let book_list_len = book_list.length;
            for (let i = 0; i < book_list_len; i++) {
                book_list[i]['title'] = book_list[i]['title'].toUpperCase();
                book_list[i]['title'] = i + 1 + ") " + book_list[i]['title'];
                let k1 = new dashboard_page_cards().book_row_card(book_list[i]);
                $(book_box).append(k1);
            }
        }); // End of API call
    }

    refresh_book_list_special(limit, skip, special_filter) {
        let url = "/api/v1/get_book_list_special";
        let method = "POST";
        let the_data = {
            "limit": limit,
            "skip": skip,
            "special_filter": special_filter,
            "organization": $('#current_user_organization').val()
        }
        let data = JSON.stringify(the_data);
        let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
            console.log(response);
            let book_list = response['data'];
            let book_box = $('#books_box');

            let book_list_len = book_list.length;
            for (let i = 0; i < book_list_len; i++) {
                book_list[i]['title'] = book_list[i]['title'].toUpperCase();
                book_list[i]['title'] = i + 1 + ") " + book_list[i]['title'];
                let k1 = new dashboard_page_cards().book_row_card(book_list[i]);
                $(book_box).append(k1);
            }
        }); // End of API call
    }




}