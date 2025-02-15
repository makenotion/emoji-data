<?php
	$json = file_get_contents('../../emoji.json');
	$data = json_decode($json, true);

	shell_exec("rm -f ../../img-twitter-72/*.png");

	foreach ($data as $row){
		if (strlen($row['image'])){
			if ($row['non_qualified']){
				fetch($row['image'], StrToLower($row['non_qualified']).'.png');
			}else{
				fetch($row['image']);
			}
		}

		if (isset($row['skin_variations'])){
			foreach ($row['skin_variations'] as $row2){

				fetch($row2['image']);
			}
		}
	}

	echo "\nDONE\n";


	function fetch($img, $alt_img=null){
		$alt_svg = str_replace(".png", ".svg", $alt_img);

		$src_img = $img;
		if (substr($src_img, 0, 2) == '00') $src_img = substr($src_img, 2, 2) . '-20e3.png';

		if ($src_img == 'a9-20e3.png') $src_img = 'a9.png';
		if ($src_img == 'ae-20e3.png') $src_img = 'ae.png';

		$dst = "../../img-twitter-72/{$img}";
		$src = "twemoji/assets/72x72/{$src_img}";

		$svg_img = str_replace(".png", ".svg", $img);
		$svg_src_img = str_replace(".png", ".svg", $src_img);
		$svg_dst = "../../svg-twitter/{$svg_img}";
		$svg_src = "twemoji/assets/svg/{$svg_src_img}";

		#echo "$src -> $dst\n";
		#return;

		if (!file_exists($src) && $alt_img){
			$new_src = "twemoji/assets/72x72/{$alt_img}";
			$new_svg_src = "twemoji/assets/svg/{$alt_svg}";
			if (file_exists($new_src)){
				$src = $new_src;
				$svg_src = $new_svg_src;
			};
		}

		if (!file_exists($src)){
			$new_src = "twemoji/assets/72x72/".str_replace('-fe0f', '', $src_img);
			if (file_exists($new_src)) $src = $new_src;
		}

		if (!file_exists($src)){
			echo "\nNot found: $src\n";
			return;
		}

		copy($src, $dst);
		copy($svg_src, $svg_dst);
		echo '.';
	}
