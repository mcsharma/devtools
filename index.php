<?php

$q = $_GET['q'] ?: "";
$fileType = $_GET['fileType'] ?: "";
$cs = $_GET['cs'] === "1" ? 1 : 0;
$ww = $_GET['ww'] === "1" ? 1 : 0;

$results = array();
$exec_time_ms = 0; // in milliseconds
if ($q) {

    $time_start = microtime(true);
    if (PHP_OS == "Darwin") {
        // Hardcoded sample results for mac. It hard to setup csearch index on mac.
        // so hardcoding some results, so that we can develop on mac.
        $results = array_filter(
            explode("\n", file_get_contents("sample_results.txt")));
        $q = "KillProcesses";
    } else {
        $options = "-n";
        if (!$cs) {
            $options .= " -i";
        }
        if ($fileType) {
            $options .= " -f \\.".$fileType."$";
        }
        $escaped_q = addslashes(preg_quote($q));
        if ($ww) {
            $escaped_q = "\\b".$escaped_q."\\b";
        }
        exec("sudo -u www-data csearch $options \"$escaped_q\" 2>&1", $results);
    }
    $time_end = microtime(true);
    $exec_time_ms = ($time_end - $time_start) * 1000;

    $finalResults = array();
    foreach ($results as $rawResult) {
        $result = substr($rawResult, 26);
        $parts = explode(':', $result);
        $filePath = array_shift($parts);
        $lineNum = intval(array_shift($parts));
        $line = implode(':', $parts);
        $finalResults[$filePath][$lineNum] = $line;
    }
}

$data = json_encode(array(
    "prefix" => "http://www.thoughtspot.co/diffusion/2/browse/master/",
    "q" => $q,
    "results" => $finalResults,
    "fileType" => $fileType,
    "cs" => $cs,
    "ww" => $ww,
    "execTimeMs" => intval($exec_time_ms),
));
?>

<html>
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script type="text/javascript" src="js/bundle.js"></script>
    <script>
        var responseData = <?php echo $data;?>;
    </script>
</head>
<body>
<div id="container"></div>
</body>
</html>
