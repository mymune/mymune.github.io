<?php
// user agent list!
/*
~*nmap	1;
~*nikto1	1;
~*wikto	1;
~*sf 1;
~*sqlmap 1;
~*bsqlbf	1;
~*acunetix 1;
~*havij 1;
~*appscan 1;
~*wpscan 1;
~*mj12bot 1;
~*ApacheBench 1;
~*WordPress 1;
~*DirBuster 1;
~*perl 1;
~*PhpStorm 1;
~*python 1;
~*w3af 1;
~*WhatWeb 1;
~*Arachni 1;
~*XSpider 1;
~*Hydra 1;
~*Evasions 1;
~*OpenVas 1;
~*visionutils 1;
~*Synapse	1;
~*HTTP_Request2	1;
~*GuzzleHttp	1;
~*Paros	1;
~*Synapse	1;
~*Python-urllib	1;   */
    useragents = []string{
        "(Hydra)", ".nasl", "absinthe", "advanced email extractor",
        "arachni/", "autogetcontent", "bilbo", "BFAC",
        "brutus", "brutus/aet", "bsqlbf", "cgichk",
        "cisco-torch", "commix", "core-project/1.0", "crimscanner/",
        "datacha0s", "dirbuster", "domino hunter", "dotdotpwn",
        "email extractor", "fhscan core 1.", "floodgate", "get-minimal",
        "gootkit auto-rooter scanner", "grabber", "grendel-scan", "havij",
        "inspath", "internet ninja", "jaascois", "zmeu", "masscan", "metis", "morfeus fucking scanner",
        "mysqloit", "n-stealth", "nessus", "netsparker",
        "Nikto", "nmap nse", "nmap scripting engine", "nmap-nse",
        "nsauditor", "openvas", "pangolin", "paros",
        "pmafind", "prog.customcrawler", "qualys was", "s.t.a.l.k.e.r.",
        "security scan", "springenwerk", "sql power injector", "sqlmap",
        "sqlninja", "teh forest lobster", "this is an exploit", "toata dragostea",
        "toata dragostea mea pentru diavola", "uil2pn", "user-agent:", "vega/",
        "voideye", "w3af.sf.net", "w3af.sourceforge.net", "w3af.org",
        "webbandit", "webinspect", "webshag", "webtrends security analyzer",
        "webvulnscan", "whatweb", "whcc/", "wordpress hash grabber",
        "xmlrpc exploit", "WPScan", "curl",
    }


//List user-agents below you wish to ban in correct format




    $browser = array ("Wget", "EmailSiphon", "WebZIP","MSProxy/2.0","EmailWolf","webbandit","MS FrontPage");

    $punish = 0;
    while (list ($key, $val) = each ($browser)) {
        if (strstr ($HTTP_USER_AGENT, $val)) {
            $punish = 1;
        }
    }

//Be sure to edit the e-mail address and custom page info below

    if ($punish) {
        // Email the webmaster
        $msg .= "The following session generated banned browser agent errors:\n";
        $msg .= "Host: $REMOTE_ADDR\n";
        $msg .= "Agent: $HTTP_USER_AGENT\n";
        $msg .= "Referrer: $HTTP_REFERER\n";
        $msg .= "Document: $SERVER_NAME" . $REQUEST_URI . "\n";
                $headers .= "X-Priority: 1\n";
                $headers .= "From: Ban_Bot <bot@yourdomain.com>\n";
                $headers .= "X-Sender: <bot@yourdomain.com>\n";

        mail ("webmaster@yourdomain.com", "BANNED BROWSER AGENT ERROR", $msg, $headers


);

        // Print custom page
        echo "<HTML>
                      <head>
                      <title>Access Denied</title>

                      </head>


                      <p>We're sorry. The software you are using to access our website is not allowed.
                         Some examples of this are e-mail harvesting programs and programs that will
                         copy websites to your hard drive. If you feel you have gotten this message
                         in error, please send an e-mail addressed to admin. Your I.P. address has been logged
                         Thanks.</p>
                         <BR>
                         -Yourname
                         <BR>
                         </body>

                         </HTML>";
        exit;
    }

?>