<?php
$q = $_GET['q'];
$q = $q ?: "";
$results = array();
if ($q) {
    if (PHP_OS == "Darwin") {
        // Hardcoded sample results for mac. It hard to setup csearch index on mac.
        // so hardcoding some results, so that we can develop on mac.
        $results = array(
            "/home/mahesh/_thoughtspot/callosum/metadata/src/test/java/com/thoughtspot/callosum/metadata/MetadataHeaderTest.java:23: *" .
            " @author Mahesh Sharma",
            "/home/mahesh/_thoughtspot/callosum/metadata/src/test/java/com/thoughtspot/callosum/metadata/MetadataHeaderUnitTest.java:26: *" .
            " @author Mahesh Sharma",
        );
    } else {
        $options = "-n";
        exec("sudo -u www-data csearch $options \"$q\" 2>&1", $results);
    }
}

$data = json_encode(array(
    "prefix" => "http://www.thoughtspot.co/diffusion/2/browse/master/",
    "q" => $q,
    "results" => $results,
));
?>

<html>
<head>
    <link rel="stylesheet" type="text/css" href="style.css"></link>
    <script type="text/javascript" src="js/bundle.js"></script>
    <script>
        var responseData = <?php echo $data;?>;
    </script>
</head>
<body>
    <div id="container" />
</body>
</html>