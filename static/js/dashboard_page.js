$(document).ready(function () {
    $('#register_new_book').click(function () {
        let k1 = new dashboard_page_cards().register_new_book_div();
        $('body').append(k1);
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
        form.setAttribute('class', 'w-full max-w-lg shadow-lg p-2');
        form.setAttribute('action', '/api/v1/book/register');
        form.setAttribute('method', 'POST');
        form.setAttribute('enctype', 'multipart/form-data');
        form.setAttribute('autocomplete', 'off');
        // ['title', 'author', 'isbn', 'genre', 'description', 'tags', 'noofcopies']
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
            let url = "/api/v1/admin/books/register";
            let method = "POST";
            let data = JSON.stringify(form_data_json);
            let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                console.log(response);
                if (response['status'] == 200) {
                    alert("Book registered successfully");
                    $(r1).remove();
                } else {
                    alert("Error in registering book");
                }
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
}