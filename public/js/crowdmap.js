
window.crowdmapAPI = {

	signRequest: function (method, path) {
        var now = Math.round(new Date().getTime() / 1000),
            sig = JSON.parse(window.atob(window.apiSignature)),
            validation = method.toUpperCase() + "\n" + now + "\n" + path + "\n";
        return "A" + sig[0] + CryptoJS.HmacSHA1(validation, sig[1]);
	},

	queryBinary: function (method, path, data, callback) {
        callback = callback || function() { };

        if (path.substr(0, window.apiEndpoint.length) === window.apiEndpoint) {
            path = path.substr(window.apiEndpoint.length);
        }

        if (path.indexOf('?') >= 0) {
            path += '&';
        } else {
            path += '?';
        }

        path += 'apikey=' + crowdmapAPI.signRequest(method, path.substr(0, path.indexOf('?')));

        if (path.substr(0, 4) !== "http") {
            path = window.apiEndpoint + path;
        }

        var xhr = new XMLHttpRequest();
        xhr.open(method, path, true);

        if (xhr.upload !== void(0)) {
            xhr.upload.addEventListener("progress", function(event) {
                callback('uploading', event);
            }, false);
        }

        xhr.onreadystatechange = function (event) {
            var xhr = event.target;

            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.readyState, jQuery.parseJSON(xhr.responseText));
            } else {
                callback(xhr.readyState, null);
            }
        };

        xhr.send(data);
    },

    Query: function (method, path, data, callback, callback_error, callback_closed, contextObject, headers) {
        if (!callback) {
            return false;
        }

        callback_error      = callback_error || function() {};
        callback_closed     = callback_closed || function() {};
        contextObject       = contextObject || {};

        if (path.substr(0, window.apiEndpoint.length) === window.apiEndpoint) {
            path = path.substr(window.apiEndpoint.length);
        }

        if (method === 'DELETE' || method === 'PUT') {
            data._METHOD = method;
            method = 'POST';
        }

        data.apikey = crowdmapAPI.signRequest(method, path);

        if (path.substr(0, 4) !== "http") {
            path = window.apiEndpoint + path;
        }

        $.ajax({
            type:          method,
            dataType:      'json',
            url:           path,
            crossDomain:   true,
            data:          data,
            cache:         false,

            beforeSend: function(xhr) {
                var header = null;

                if (typeof headers === 'object') {
                    for (header in headers) {
                        if (headers[header] !== void(0)) {
                            xhr.setRequestHeader(header, headers[header]);
                        }
                    }
                }
            },
            success: function(data) {
                callback(data, contextObject);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                callback_error(contextObject);
            },
            complete: function() {
                callback_closed(contextObject);
            }
        });
    }

};

window.uploadManager = {

	selectFile: function(element, event, filetypes, callbackSuccess, callbackFailure) {
		//root.addFileSelectorTriggered = true;
		if(!callbackSuccess) callbackSuccess = function() {};
		if(!callbackFailure) callbackFailure = function() {};
		if(!filetypes) filetypes = ['image/png', 'image/jpg', 'image/gif', 'image/jpeg'];

		var t = 0;

		if( event.target.files !== void(0) && event.target.files.length) {

			if ( event.target.files.length > 1 ) {
				event.preventDefault();
				alert("Please upload one file at a time.");
				callbackFailure();
				return false;
			}

			for(var f = 0; f < event.target.files.length; f++) {
				var file = event.target.files[f];

				if(file.type !== void(0) && file.type.length) {
					for(t = 0; t < filetypes.length; t += 1) {
						if(file.type.toLowerCase() == filetypes[t].toLowerCase()) {
							callbackSuccess();
							return true;
						}
					}
				} else if(file.name !== void(0) && file.name.length) {
					for(t = 0; t < filetypes.length; t += 1) {
						if(file.name.substring(file.name.lastIndexOf('.')+1).toLowerCase() == filetypes[t].substring(filetypes[t].lastIndexOf('/')+1).toLowerCase()) {
							callbackSuccess();
							return true;
						}
					}
				} else {
					alert("You browser is not currently supported.");
					callbackFailure();
					return false;
				}

				event.preventDefault();
				alert("You cannot upload files of this type.");
				callbackFailure();
				return false;
			}

		} else if($(element).val() !== '') {

			element = $(element).val();

			// Cheap fallback for older browsers.
			for(t = 0; t < filetypes.length; t += 1) {
				if(element.substring(element.lastIndexOf('.')+1).toLowerCase() == filetypes[t].substring(filetypes[t].lastIndexOf('/')+1).toLowerCase()) {
					callbackSuccess();
					return true;
				}
			}

			element.val('');

		}

		callbackFailure();
	},

	Go: function(form, callbacks) {

		$.support.cors = true;

		var callback = {
			begin: callbacks.begin || function(preview) {},
			success: callbacks.success || function() {},
			progress: callbacks.progress || function() {},
			failure: callbacks.failure || function() {},
			finish: callbacks.finish || function() {}
		},
		preview = null;

		// Try to grab a preview of the image, if the browser supports FileReader API.
		if(window.FileReader !== void(0)) {
			var reader = new FileReader();

			if(reader) {
				reader.onload = function(e) {
					callback.begin(e.target.result);
				};

				preview = $(form).find('input[type=file]')[0];
				preview = preview.files[0];
				reader.readAsDataURL(preview);
			} else {
				callback.begin(null);
			}
		} else {
			callback.begin(null);
		}

		if(window.FormData !== void(0)) {

			// Browser supports FormData() object.
			var fileData = new FormData(form);

			window.crowdmapAPI.queryBinary('POST', $(form).attr('action'), fileData, function(state, response) {
				if(state == 4) {
					if(response) {
						if(response.success !== void(0) && response.success === true) {
							callback.success(response);
						} else {
							callback.failure(response);
						}
					} else {
						callback.failure({});
					}

					callback.finish();

				} else if (state == 'uploading') {
					if (response.lengthComputable && response.loaded < response.total) {
						callback.progress(Math.round(response.loaded / response.total * 100));
					} else {
						callback.progress(0);
					}
				} else {
					callback.progress(0);
				}

			}, function() { callback.failure({}); }, function() { $(form).removeAttr('disabled'); });

		} else {
			// TODO Fallback support for non-HTML5 browser.
		}

	}

};

window.addPhotoToStack = function(photo, topOfStack) {
	topOfStack = topOfStack || false;

	if(photo === void 0 || photo.media === void 0 || photo.media[0] === void 0)
		return false;

	photo = photo.media[0];

	var template = $("#template-photo").clone();
	template.removeAttr('id').attr('class', 'photo');
	template.find('a').css('background-image', 'url(' + photo.file_location + photo.filename_s + ')').attr('href', photo.file_location + photo.filename_l);

	if(topOfStack) {
		$("#photos").prepend(template);
		$("#photos").prepend($("#upload"));
	} else {
		$("#photos").append(template);
	}

};

window.loadPhotos = function(url) {
	window.crowdmapAPI.Query('GET', url, {}, function(response) {
		if(response && response.success !== void 0 && response.posts) {
			$(response.posts).each(function() {
				window.addPhotoToStack(this);
			});

			if(response.next !== void 0 && response.next) {
				window.loadPhotos(response.next);
			}
		}
	});
};

$(function() {

	window.loadPhotos('/maps/' + window.apiMapID + '/posts/?has=photo&limit=10');

	$(document).on('change', '#file-upload input[type=file]', function(event) {

		var inputElement = $(this);

		uploadManager.selectFile(inputElement, event, null, function() {
			var form = $(inputElement).parents("form")[0];

			uploadManager.Go(form, {
				begin: function(preview) {
					console.log('started uploading');
					$("#upload").find('span').html('...');
				},
				success: function(response) {
					console.log("succeeded");
					$("#upload").find('span').html('+');

					if(response !== void 0 && response.media !== void 0 && response.media[0] !== void 0) {
						photo = response;

						var payload = {
							"media_id": photo.media[0].media_id,
							"map_id": window.apiMapID
						};

						window.crowdmapAPI.Query('POST', '/posts/', payload, function(response) {
							window.addPhotoToStack(photo, true);
						});
					}
				},
				progress: function(percent) {
					if(percent > 0 && percent < 100) {
						console.log(percent);
					}
				},
				failure: function(response) {
					console.log('error!');
					console.log(response);
					$("#upload").find('span').html(':(');
				},
				finish: function() {
					inputElement.val('');
				}
			});
		});

	});

});
