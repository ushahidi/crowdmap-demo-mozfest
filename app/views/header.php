<!DOCTYPE html>
<html>
    <head>
        <title><?=(config::$siteName)?></title>
        <link rel="stylesheet" href="css/main.css" />
        <script src="js/jquery.js"></script>
        <script>
            window.apiSignature = '<?=base64_encode(json_encode(array(config::$apiSecret, config::$apiKey))) ?>';
            window.apiEndpoint = '<?=config::$apiEndpoint; ?>';
            window.apiMapID = '<?=config::$mapID; ?>';
        </script>
        <script src="js/hmac-sha1.js"></script>
        <script src="js/crowdmap.js"></script>
    </head>
    <body>
        <div id="top">

            <header>
                <h1><a href="/"><img src="img/header.png" /></a></h1>
                <h2>Event Gallery Demo</h2>
            </header>
