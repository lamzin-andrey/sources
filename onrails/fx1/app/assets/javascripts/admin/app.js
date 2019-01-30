(
	function() {
		var W = window,
		    $ = jQuery;
		W.adminApp = {
			alert:function(s) {
				alert(s);
			}
		}
		$(
			function () {
				onReady();
			}
		);
		W.onReady = function() {
			$(".ajax_sub").each(
				function (i, item) {
					item.onclick = showLoader;
				}
			);
		}
	}
)
()
