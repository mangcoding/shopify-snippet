"use strict";

Shopify.theme.jsCollection = {
    init: function init($section) {
        // Add settings from schema to current object
        Shopify.theme.jsCollection = $.extend(this, Shopify.theme.getSectionData($section));

        if (this.enable_filter == true || this.enable_sorting == true) {
            $('#sort-by').val($('#sort-by').data('default-sort'));
            $('#tag_filter, #sort-by').on('change', function () {
                Shopify.theme.jsCollection.filterURL();
            });
        }
    },
    filterURL: function filterURL() {
        var selectedOptions = [],
            query = '',
            currentTags = '',
            siteUrl = 'https://' + $.url('hostname'),
            url1 = $.url('1') ? '/' + $.url('1') + '/' : '',
            url2 = $.url('2') ? $.url('2') + '/' : '',
            url3 = $.url('3'),
            path = url1 + url2; //Handle dropdowns if they exist

        if ($('#sort-by').length) {
            query = $('#sort-by').val();
        } else {
            query = url('?sort_by');
        }

        if ($('#tag_filter').length) {
            if ($('#tag_filter').data('default-collection') != $('#tag_filter').val()) {
                var urlTag = $('#tag_filter').val().substr($('#tag_filter').val().lastIndexOf('/') + 1);

                if (urlTag != 'all') {
                    if ($.inArray(urlTag, selectedOptions) > -1) { //Do nothing
                    } else {
                        selectedOptions.unshift(urlTag);
                    }
                }
            }
        } //Loop through tags to create string to update page url


        $.each(selectedOptions, function (i, value) {
            if (i != selectedOptions.length - 1) {
                currentTags += selectedOptions[i] + '+';
            } else {
                currentTags += selectedOptions[i];
            }
        });
        Shopify.theme.queryParams.sort_by = query;
        query = '?' + $.param(Shopify.theme.queryParams);
        this.processUrl(path, currentTags, query);
    },
    newFilterURL: function newFilterURL(currentTags) {
        var selectedOptions = [],
            query = '',
            siteUrl = 'https://' + $.url('hostname'),
            url1 = $.url('1') ? '/' + $.url('1') + '/' : '',
            url2 = $.url('2') ? $.url('2') + '/' : '',
            url3 = $.url('3'),
            path = url1 + url2; //Handle dropdowns if they exist

        if ($('#sort-by').length) {
            query = $('#sort-by').val();
        } else {
            query = url('?sort_by');
        }

        Shopify.theme.queryParams.sort_by = query;
        query = '?' + $.param(Shopify.theme.queryParams);
        this.processUrl(path, currentTags, query);
    },
    updateView: function updateView(filterURL) {
        $.ajax({
            type: 'GET',
            url: filterURL,
            beforeSend: function beforeSend() {
                $(".collection-matrix").addClass('fadeOut animated loading-in-progress');
            },
            success: function success(data) {},
            error: function error(x, t, m) {
                console.log(x);
                console.log(t);
                console.log(m);
                location.replace(location.protocol + '//' + location.host + filterURL);
            },
            dataType: "html"
        }).then(function (data) {
            var breadcrumbContainer = $('.breadcrumb__container');
            var collectionMatrixWrapper = $('.collection-matrix__wrapper');
            var collectionMatrix = $('.collection-matrix');
            var pagination = $('.container--pagination'); // Get and set new breadcrumb html

            var filteredBreadcrumb = $(data).find('.breadcrumb__container').html();
            breadcrumbContainer.html(filteredBreadcrumb); // Remove loading animation

            collectionMatrix.removeClass('loading-in-progress'); // Get and set filtered collection thumbnails

            var filteredData = $(data).find('.collection-matrix');
            collectionMatrix.empty();
            collectionMatrixWrapper.append(filteredData); // Get and set new pagination

            var filteredPageLinks = $(data).find('.container--pagination').html();
            pagination.html(filteredPageLinks);
            window.history && window.history.pushState && window.history.pushState("", "", filterURL);

            if (Shopify.theme_settings.enable_shopify_collection_badges == true) {
                Shopify.theme.productReviews();
            }

            if (Shopify.theme_settings.show_multiple_currencies) {
                convertCurrencies();
            }
        });
    },
    processUrl: function processUrl(path, tags, query) {
        var query = query.replace(/\page=(\w+)&/, ''),
            urlString = '';
        urlString = path + tags + query;
        this.updateView(urlString);
    },
    unload: function unload($section) {
        $('#tag_filter, #sort-by').off(); // Add settings from schema to current object

        Shopify.theme.jsCollection = $.extend(this, Shopify.theme.getSectionData($section));

        if (this.enable_filter == true) {
            Shopify.theme.filter.collectionFilter();
        }
    }
};