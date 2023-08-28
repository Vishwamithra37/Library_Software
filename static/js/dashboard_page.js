$(document).ready(function () {
    $('#register_new_book').click(function () {
        let k1 = new dashboard_page_cards().register_new_book_div();
        $('body').append(k1);
    });
});

$(document).ready(function () {
    new dashboard_page_API_calls().refresh_book_list(10, 0, "all");

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

    book_row_card(book_data) {
        //     <div class="w-full flex flex-col shadow-md border-b-2 border-gray-200">
        //     <div class="flex flex-row justify-items-end text-black font-semibold p-2">
        //         <span>1)<span> Higher Engineering Mathematics</span> </span>
        //         <span class="text-base float-right ml-auto mr-2">Lend</span>
        //         <!-- <span class="text-base float-right ml-auto mr-2">Make Unavailable</span>
        //         <span class="text-base float-right ml-auto mr-2">Hide Book</span> -->
        //     </div>
        //     <div
        //         class="w-full text-right bg-gray-200 font-semibold  hover:text-green-600 text-green-500 cursor-pointer pl-2 pr-2 rounded-b-lg">
        //         Show Details
        //     </div>
        // </div>
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
        let return_button = new GENERIC_META_CALL().Generic_span(
            "text-base float-right ml-auto mr-2 pl-3 text-black hover:font-bold cursor-pointer",
            "Return-Book"
        )
        $(buttons_wrapper_div).append(lend_button);
        $(buttons_wrapper_div).append(return_button);




        $(lend_button).click(function (e) {
            let lend_card = new dashboard_page_cards().rent_button_card(book_data);
            lend_card[0] = new GENERIC_META_FLOATING_DIVS().multi_col_stack_floater(lend_card[0]);
            $(lend_card[1]).click(function () {
                $(lend_card[0]).remove();
            });
            $('body').append(lend_card[0]);
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
                "skip": 0
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
            if (the_renting_form.reportValidity()) {
                let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing rent...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
                $('body').append(status);
                let user_data = JSON.parse($(User_Name_search_bar[1]).attr('data-all_info'));
                let form_data = {
                    "book_id": book_data['sid'],
                    "user_id": user_data['sid'],
                    // "user_email": $(User_Name_search_bar[1]).val(),
                    "noofdays": $(Number_of_days_input).val()
                }
                console.log(form_data);
                let url = "/api/v1/admin/books/rent";
                let method = "POST";
                let data = JSON.stringify(form_data);
                let r1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, method, data).then(function (response) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Successfully rented book", 'bg-green-500 p-2 text-white text-sm font-bold rounded', 3000)
                    $('body').append(status2);
                    $(the_array[0]).remove();
                }).catch(function (error) {
                    $(status).remove();
                    let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Error in renting book", 'bg-red-500 p-2 text-white text-sm font-bold rounded', 1000)
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
                book_data['rentedcopies']
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
            user_data["Library"]['Number_of_books_rented_currently']
        );
        let Number_of_books_returned_successfully = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of books returned successfully: "
        );
        let Number_of_books_returned_successfully_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"]['Number_of_books_returned']
        );
        let Number_of_times_overdue = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Number of times overdue: "
        );
        let Number_of_times_overdue_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"]['Number_of_times_overdue']
        );
        let Fine_amount_yet_to_be_paid = new GENERIC_META_CALL().Generic_label(
            "block text-gray-700 text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            "Fine amount yet to be paid: "
        );
        let Fine_amount_yet_to_be_paid_value = new GENERIC_META_CALL().Generic_span(
            "block text-green-500 font-bold text-sm font-bold mt-2 dark:text-white dark:border-gray-600 dark:bg-gray-700",
            user_data["Library"]['Total_fine_amount']
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
}
class dashboard_page_API_calls {
    refresh_book_list(limit, skip, special_filter) {
        let url = "/api/v1/get_book_list";
        let method = "POST";
        let the_data = {
            "limit": limit,
            "skip": skip,
            "special_filter": special_filter
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