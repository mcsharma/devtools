<html>
<head>
<link rel="stylesheet" type="text/css" href="style.css"></link>
<script type="text/javascript" src="js/bundle.js"></script>
</head>
<body>
<div id="example"></div>
<?php
$q = $_GET['q'];
$q = $q ?: "";
$output = array();
$exitcode = 0;
if ($q) {
	$sensitive = $_GET['sensitive'] ?: 0;
	$options = "-n";
	if (!$sensitive) $options = $options." -i";
	exec("sudo -u www-data csearch $options \"$q\" 2>&1", $output, $exitcode);
}
$BASE = "http://www.thoughtspot.co/diffusion/2/browse/master/";
?>
<div><form>
<input 
name="q"
type="text" 
placeholder="type text to search" 
value="<?php echo htmlspecialchars($q) ?>"/>
<input type="submit" caption="Search" action="/" method="get" />
<?php echo count($output)?> Results Found!
<span class="caseinput">
</span>
</div>
<?php if ($q) { ?>
	<div>Search Results:</div>
		<?php 
		foreach ($output as $res) {
		  $splits = explode(':',substr($res, 25), 3);
	   	$link = $BASE.$splits[0]."$".$splits[1];
	   	echo "<div><a href='$link' >$splits[0]:$splits[1]</a></div>";
  		$splits[2] = preg_replace("/\w*?".preg_quote($q)."\w*/i", "<b>$0</b>", $splits[2]);					
  		echo "<div>$splits[2]</div><br/>";
    }
  }
?>
</form>
</body>
</html>
