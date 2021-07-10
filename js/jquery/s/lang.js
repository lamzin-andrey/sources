var LangLoader = {
	init:function(lib) {
		lib._get(LangLoader.onLoadLang, '/lang', LangLoader.onFailLoadLang);
	},
	onFailLoadLang: function(){
	},
	onLoadLang    : function(data, i, j){
		for (i in data) {
			for (j in data[i].values) {
				if (data[i].scope) {
					Lang[ data[i].scope + '.' + j ] = data[i].values[j];
				}
			}
		}
		if (data.currenciesMap) {
			AppACME.currenciesMap = data.currenciesMap;
		}
	}
};
function __(s, placeholders) {
	if (!Lang[s] && ~s.indexOf('messages.')) {
		var t = s.replace('messages.', '');
		if (Lang[t]) {
			s = t;
		}
	}
	if (Lang[s]) {
		if (placeholders) {
			var q = Lang[s], i;
			for (var i in placeholders) {
				q = q.replace(i, placeholders[i]);
			}
			return q;
		}
		return Lang[s];
	}
	return s;
}
function trans(s) {
	return __(s);
}
