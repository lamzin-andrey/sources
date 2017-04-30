'/config.php';
'/mysql.php';
'/utils.php';
function App(onSuccess, onProgress) {
	this._actionPost();
	this.onSuccess = onSuccess;
	this.onProgress = onProgress;
}
App.prototype._actionPost = function() {
    
    var $word, $n, $rows, $word2, $buf, $length, $lim, $row, $aWords, $w, $i, phpjslocvar_0, phpjslocvar_1;
    
    $word = reqread('word', 'POST');
    $word = trim($word);
    $n = 0;
    $rows = [];
    if ($word) {
        $word = str_replace('\'', '`', $word);
        $word2  = $word + ' ..';
        if ($word != 'r') {//TODO move code to callback
			this.word = $word;
            $rows = query("SELECT word, description, source FROM sts WHERE word LIKE('" + $word + "%')   LIMIT 30", [this, this.onSearchData], [this, this.onProgressData]);
            
        } else {//TODO move code to callback
            $rows = query("SELECT word, description, source FROM sts ORDER BY RAND() LIMIT 5", [this, this.onRandomData]);//TODO rewrite query() with callback
            
        }
        //print_r($rows);die;

    }
    //require_once __DIR__ + '/index.tpl.php';
    this.rows = $rows;
    this.n = $n;
}

App.prototype.onRandomData = function(obj, method, $rows, $numRows, $affected) {
	var $word, $n, $rows, $word2, $buf, $length, $lim, $row, $aWords, $w, $i, phpjslocvar_0, phpjslocvar_1;
	for ($i in $rows) { $row = $rows[$i];
		$rows[$i]['description'] = $row['word'] + ': ' + $row['description'];
	}
	obj.rows = $rows;
	obj.n = count($buf);
	obj.onSuccess();//TODO
}

App.prototype.onSearchData = function($rows, $numRows, $affected, error) {
	/*console.log(this.word);
	console.log(arguments);
	return;/**/
	if (error) {
		this.showAppError(error);
		return;
	}
	var $word, $n, $rows, $word2, $buf, $length, $lim, $row, $aWords, $w, $i, phpjslocvar_0, phpjslocvar_1, obj = this;
	$buf = [];
	$word = obj.word;
	$length = strlen($word);
	$lim = 10;
	$lim = ($length * 2 > $lim) ? $lim : $length * 2 ;
	for (phpjslocvar_0 in $rows) { $row = $rows[phpjslocvar_0];
		//$aWords = preg_split("#\s#", trim($row['word']));
		$aWords = trim($row['word']).split(/\s/m);
		for (phpjslocvar_1 in $aWords) { $w = $aWords[phpjslocvar_1];
			if ( Math.abs($length - strlen(trim($w) ) ) < $lim) {
				$buf.push($row);
				break;
			}
		}
		
	}
	$rows = $buf;
	obj.rows = $rows;
	obj.n = count($buf);
	obj.onSuccess(obj);//TODO
}
App.prototype.showAppError = function(error) {
	alert(error);
}
App.prototype.onProgressData = function(n, part) {
	this.onProgress(n, part);//TODO
}
	
