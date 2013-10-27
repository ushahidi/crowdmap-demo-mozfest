<?php

	class Template {

		public static function Render($view, $vars = array(), $wrap = true) {

			if($wrap)
				require_once(INCLUDE_PATH_VIEWS . 'header.php');

			require(INCLUDE_PATH_VIEWS . "{$view}.php");


			if($wrap)
				require_once(INCLUDE_PATH_VIEWS . 'footer.php');

		}

	}
