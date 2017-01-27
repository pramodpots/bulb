$(document).ready(function(){
    $('#add-projects').click(function(){
        var name = '<div class="form-group"><label for="pjName" class="col-sm-2 control-label">Project Name*</label><div class="col-sm-10"><input id="inputpjName" type="text" placeholder="Project Name" required="true" name="pjName" class="form-control"/></div></div>'
var details = '<div class="form-group"><label for="pjDetails" class="col-sm-2 control-label">Project Details*</label><div class="col-sm-10"><textarea id="inputpjDetails" rows="3" type="text" placeholder="Tech/Lang/Tools used / Shor discription" required="true" name="email" class="form-control"></textarea></div></div>'
var img = '<div class="form-group"><label for="pjImg" class="col-sm-2 control-label">Project Image*</label><div class="col-sm-10"><input id="inputpjImg" type="text" placeholder="insert image" name="pjImg" class="form-control"/></div></div>'
var link = '<div class="form-group"><label for="pjLink" class="col-sm-2 control-label">Link*</label><div class="col-sm-10"><input id="inpupjtLink" type="text" placeholder="Github repo/ website link" required="true" name="pjLink" class="form-control"/></div></div><hr/>'
        console.log('projects');
        var myDiv = name+details+img+link;
        $('#projects').append(myDiv);
    })
})

