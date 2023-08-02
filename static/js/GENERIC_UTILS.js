class GENERIC_APICALLS {
    async GenericAPICall(url, method, data) {
        let r1 = await $.ajax({
            url: url,
            method: method,
            data: data,
            success: function (data) {
                return data;
            },
            error: function (error) {
                return error;
            }
        });
        return r1;
    }
    async GenericAPICallv2(url, method, data) {
        let r1 = await $.ajax({
            url: url,
            method: method,
            data: data,
            success: function (data) {
                return [data.status, data.data]
            },
            error: function (error) {
                return [error.status, error.data]
            }
        });
        return r1;
    }
    async GenericAPIJSON_CALL(url, method, data) {
        let r1 = await $.ajax({
            url: url,
            method: method,
            data: data,
            contentType: "application/json",
            success: function (data) {
                return [data.status, data.data]
            },
            error: function (error) {
                return [error.status, error.data]
            }
        });
        return r1;
    }

}
class GENERIC_META_CALL {
    Generic_button(classer, text) {
        let button = document.createElement("button");
        $(button).addClass(classer);
        $(button).text(text);
        return button;
    }
    Generic_div(classer, text) {
        let div = document.createElement("div");
        $(div).addClass(classer);
        $(div).text(text);
        return div;
    }
    Generic_span(classer, text) {
        let span = document.createElement("span");
        $(span).addClass(classer);
        $(span).text(text);
        return span;
    }
    Generic_label(classer, text) {
        let label = document.createElement("label");
        $(label).addClass(classer);
        $(label).text(text);
        return label;
    }
    Generic_input(classer, placeholder, value) {
        let input = document.createElement("input");
        $(input).addClass(classer);
        $(input).attr("placeholder", placeholder);
        $(input).val(value);
        return input;
    }
    Generic_textarea(classer, placeholder) {
        let textarea = document.createElement("textarea");
        $(textarea).addClass(classer);
        $(textarea).attr("placeholder", placeholder);
        return textarea;
    }
    wrap_me_in_link(element, url) {
        let a_element = document.createElement('a');
        $(a_element).attr('href', url);
        $(element).wrap(a_element);
    }

    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }
    search_bar_dropdown(total_max_height, search_bar_class, search_bar_place_holder, search_bar_dropdown_class) {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('static flex flex-col overflow-y-auto ' + total_max_height);
        let search_barer = document.createElement('input');
        $(search_barer).addClass(search_bar_class);
        $(search_barer).attr('placeholder', search_bar_place_holder);

        let dropdown_div = document.createElement('div');
        $(dropdown_div).addClass(search_bar_dropdown_class + ' overflow-y-auto relative z-50');
        $(wrapper_div).append(search_barer);
        $(wrapper_div).append(dropdown_div);

        return [wrapper_div, search_barer, dropdown_div];
    }
}
class GENERIC_META_FLOATING_DIVS {
    bottom_bar_notification(message, classer, timeout = 3000) {
        let wrapperdiv = document.createElement('div');
        // This needs to appear at the top middle of the screen.
        $(wrapperdiv).addClass('fixed w-full top-0 z-50 flex justify-center items-center pointer-events-none mt-2');
        let notification_div = document.createElement('div');
        $(notification_div).addClass(classer);
        notification_div.innerHTML = message;
        wrapperdiv.appendChild(notification_div);

        // Wrapperdiv will vanish after timeout.
        setTimeout(function () {
            $(wrapperdiv).remove();
        }, timeout);
        return wrapperdiv;
    }

    security_popup(message, choose_message) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('bg-green-500 text-white rounded-lg p-2 m-2');
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('bg-red-500 text-white rounded-lg p-2 m-2 cursor-pointer ');
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        choose_div.appendChild(no_button);
        notification_div.appendChild(message_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button];
    }


    custom_bg_security_popup(message, choose_message, bg_of_yes, bg_of_no) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-50 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('rounded-lg p-2 m-2 cursor-pointer');
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('rounded-lg p-2 m-2 cursor-pointer ');
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        $(yes_button).addClass(bg_of_yes);
        choose_div.appendChild(no_button);
        $(no_button).addClass(bg_of_no);
        notification_div.appendChild(message_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button];
    }

    security_popup_post_page(message, choose_message, bg_of_yes, bg_of_no) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2 border-2 border-gray-200');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('p-2 m-2 cursor-pointer');
        $(yes_button).addClass(bg_of_yes);
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('p-2 m-2 cursor-pointer ');
        $(no_button).addClass(bg_of_no);
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        choose_div.appendChild(no_button);
        notification_div.appendChild(message_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button];
    }

    security_popup_post_page_with_option_to_input_text(message, placeholder, choose_message, bg_of_yes, bg_of_no) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2 border-2 border-gray-200');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let input_div = document.createElement('div');
        $(input_div).addClass('flex justify-center items-center');
        let input_box = document.createElement('textarea');
        $(input_box).addClass('p-2 m-2 cursor-text outline-none text-center h-20 w-96');
        $(input_box).addClass('bg-black text-white');
        input_box.placeholder = placeholder;
        $(input_div).append(input_box);

        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('p-2 m-2 cursor-pointer');
        $(yes_button).addClass(bg_of_yes);
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('p-2 m-2 cursor-pointer ');
        $(no_button).addClass(bg_of_no);
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        choose_div.appendChild(no_button);
        notification_div.appendChild(message_div);
        notification_div.appendChild(input_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button, input_box];
    }

    multi_col_div_ontop(options, yes_button, no_button) {
        // Options is an array of Elements. Each specifying the content of each column.
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex flex-col justify-center items-center bg-black bg-opacity-50 border-gray-700');
        let wrapper_2 = document.createElement('div');
        $(wrapper_2).addClass('flex flex-col justify-center items-center bg-gray-900 rounded-lg shadow-lg p-2 border border-gray-200');
        $(wrapperdiv).append(wrapper_2);
        let len_of_options = options.length;
        for (let i = 0; i <= len_of_options; i++) {
            $(wrapper_2).append(options[i]);
        }
        $(wrapper_2).append(yes_button);
        $(wrapper_2).append(no_button);

        return wrapperdiv;
    }

    multi_col_stack_floater(stacks) {
        // Options is an array of Elements. Each specifying the content of each column.
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed z-40 w-full h-full  top-0 flex justify-center items-center bg-white dark:bg-black bg-opacity-50 border-gray-700 shadow-lg overflow-y-auto');
        let wrapper_2 = document.createElement('div');
        $(wrapper_2).addClass('flex flex-col w-full   md:w-2/6 h-5/6 bg-gray-900 bg-white shadow-lg p-2 border border-black border-gray-200 dark:bg-gray-900 shadow-lg rounded-lg overflow-y-auto');
        let len_of_options = stacks.length;
        for (let i = 0; i <= len_of_options; i++) {
            $(wrapper_2).append(stacks[i]);
        }
        $(wrapperdiv).append(wrapper_2);
        return wrapperdiv;
    }

}
