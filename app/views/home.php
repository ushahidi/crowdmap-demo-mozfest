<ul id="photos">
	<li id="upload"><label for="file-selector"><span>+</span></label></li>
	<li id="template-photo"><a href="#" target="_blank"></a></li>
</ul>


<!-- Hidden form for handling seamless file uploads. -->
<form id="file-upload" method="POST" action="/media/" enctype="multipart/form-data" style="position: absolute; height: 0; width: 0; opacity: 0;">
	<input type="file" id="file-selector" name="file" style="height: 0; width: 0; opacity: 0;" />
</form>
