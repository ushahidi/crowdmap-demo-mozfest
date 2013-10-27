<?php

define('INCLUDE_PATH',  dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('INCLUDE_PATH_LIBS', INCLUDE_PATH . 'libs' . DIRECTORY_SEPARATOR);
define('INCLUDE_PATH_VIEWS', INCLUDE_PATH . 'views' . DIRECTORY_SEPARATOR);

if(! file_exists(INCLUDE_PATH . 'config.php')) {
    die(_('Please rename config.template to config.php and update the configuration as necessary.'));
}

// Include our configuration.
require 'config.php';

// Setup SlimPHP Framework.
require INCLUDE_PATH_LIBS . 'Slim' . DIRECTORY_SEPARATOR . 'Slim.php';
\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();

// Include our Crowdmap API wrapper.
require INCLUDE_PATH_LIBS . 'crowdmap.php';

// Include our super simple template system.
require INCLUDE_PATH_LIBS . 'template.php';

// Setup routes.
require 'routes.php';

// Run!
$app->run();
