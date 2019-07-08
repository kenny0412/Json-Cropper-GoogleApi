let jsonData; // variable para guardar el formulario en formato json
let ubi; // variable para guardar la ubicacion del mapa 

// Funciones del slider #1, Formulario con validaciones

(function() { // comprueba si el formulario es valido
    'use strict';
    window.addEventListener('load', function() {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) { // si el formulario es invalido
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    onSubmit(form);
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();


function solonumeros(e) { // Solo admite numeros en el teclado
    var key = window.event ? e.which : e.keyCode;
    if (key < 48 || key > 57)
        e.preventDefault();
}

function onSubmit(form) { // funcion para cambiar a formato json
    let formdata = $(form).serializeArray();
    var object = {};
    formdata.forEach(function(value, key) {
        if (value.value != "") {
            object[value.name] = value.value;
        }
    });
    var json = JSON.stringify(object, null, ' ');
    jsonData = json;
    document.getElementById('stringifyData').innerText = json;
    return false;
}

function readURL(input) { // lee la url de la imagen para colocarla en el cropper
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imgCrop').attr('src', e.target.result)
        };
        reader.readAsDataURL(input.files[0]);
        document.getElementById('imgBox').innerHTML = "<img id='imgCrop' src='#' name='imgCrop'>";
        document.getElementById('info').style.display = 'none';
        setTimeout(initCropper, 100);
    }
}

function initCropper() { // inicializa el cuadro del cropper
    var image = document.getElementById('imgCrop');
    var cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        crop: function(e) {}
    });
    mainCropper = cropper;
}
let mainCropper; // imagen antes de ser recortada
let cropedImage; //imagen recortada

function cropImage() { // funcion que recorta la imagen

    if (mainCropper) {
        let imgurl = mainCropper.getCroppedCanvas({
            width: 160,
            heigth: 90
        }).toDataURL();
        var resultImage = document.createElement('img');
        resultImage.id = 'resultImage';
        resultImage.src = imgurl;
        cropedImage = resultImage;
        console.log(cropedImage);

        if ($('#resultImage').length) {
            document.getElementById("resultImage").src = imgurl;
        } else {
            resultImage.src = imgurl;
            document.getElementById("cropResult").appendChild(resultImage);
        }
    }

}
// Slider #2 Funciones para el uso del api de google maps

function initAutocomplete() { // inicializa el mapa y le da sus funciones

    var options = { // las opciones de donde va a inicializarse el mapa
        center: { lat: 9.934739, lng: -84.087502 },
        zoom: 13,
        mapTypeId: 'roadmap'
    };
    var map = new google.maps.Map(document.getElementById('map'), options); // se crea el objeto de google maps

    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);

    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    let mark = false;
    var markers = [];

    function addMarker(props) { // funcion para añadir un marcador

        if (mark) {
            markers.setMap(null);
            markers = new google.maps.Marker({
                position: props.coords,
                map: map,
                icon: props.icon,
                draggable: true,
                animation: google.maps.Animation.DROP,
            });
        } else {
            markers = new google.maps.Marker({
                position: props.coords,
                map: map,
                icon: props.icon,
                draggable: true,
                animation: google.maps.Animation.DROP,
            });
        }
        document.getElementById('long').value = markers.getPosition().lng();
        document.getElementById('lat').value = markers.getPosition().lat();
        ubi = "La longitud es " + markers.getPosition().lng() + " y la latitud es " + markers.getPosition().lat();
        mark = map.getBounds().contains(markers.getPosition());
    }

    google.maps.event.addListener(map, 'click',
        function(event) {
            addMarker({ coords: event.latLng, map: map, });
        });
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("El lugar no tiene geografia");
                return;
            }

            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));
            document.getElementById('long').value = markers.getPosition().lng();
            document.getElementById('lat').value = markers.getPosition().lat();
            ubi = "La longitud es " + markers.getPosition().lng() + " y la latitud es " + markers.getPosition().lat();

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}


function addTable() { // funcion que añade la tabla al terminar el proceso
    var myTableDiv = document.getElementById("metric_results");
    var table = document.createElement('TABLE');
    table.id = 'infoTable';
    if (jsonData != undefined && cropedImage != undefined && ubi != undefined) {
        document.getElementById('badMessage').style.display = 'none';
        var tableBody = document.createElement('TBODY');
        table.classList = 'table';
        table.appendChild(tableBody);

        var heading = new Array();
        heading[0] = "Sliders";
        heading[1] = "Información";

        var info = new Array()
        info[0] = new Array("(Notificacion segmentada)", jsonData);
        info[1] = new Array("(Subir imagen)", cropedImage);
        info[2] = new Array("(Selección de ubicación)", ubi);

        //COLUMNAS DE LA TABLA
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);
        for (i = 0; i < heading.length; i++) {
            var th = document.createElement('TH')
            th.width = '75';
            th.appendChild(document.createTextNode(heading[i]));
            tr.appendChild(th);
        }

        //FILAS DE LA TABLA
        for (i = 0; i < info.length; i++) {
            var tr = document.createElement('TR');
            for (j = 0; j < info[i].length; j++) {
                var td = document.createElement('TD')
                td.appendChild(document.createTextNode(info[i][j]));
                tr.appendChild(td)
            }
            tableBody.appendChild(tr);
        }
        myTableDiv.appendChild(table)
    }
}
$('#finish').click(function() { // funcion del boton terminar
    $('#nav-info-tab ').tab('show');

});

$(document).ready(function(e) { // funcion para moverse por las paginas
    let notification = document.getElementById('nav-notification-tab');
    let ubication = document.getElementById('nav-ubication-tab');
    let image = document.getElementById('nav-image-tab');
    let info = document.getElementById('nav-info-tab');
    let btnPrev = document.getElementById('prev');
    let btnNext = document.getElementById('next');
    $(document).on('click', function(eve) {
        (notification.getAttribute('aria-selected') == 'true') ? btnPrev.setAttribute('disabled', ''): btnPrev.removeAttribute('disabled');
        (info.getAttribute('aria-selected') == 'true') ? btnNext.setAttribute('disabled', ''): btnNext.removeAttribute('disabled');
        if (notification.getAttribute('aria-selected') == 'true' && eve.target.id == 'next') {
            $('#next').ready(function() {
                $('#nav-image-tab ').tab('show');
                (notification.getAttribute('aria-selected') == 'true') ? btnPrev.setAttribute('disabled', ''): btnPrev.removeAttribute('disabled');
            });
        }
        if (image.getAttribute('aria-selected') == 'true' && eve.target.id == 'next') {
            $('#next').ready(function() {
                $('#nav-ubication-tab ').tab('show');
            });
        }
        if (image.getAttribute('aria-selected') == 'true' && eve.target.id == 'prev') {
            $('#prev').ready(function() {
                $('#nav-notification-tab ').tab('show');
                (notification.getAttribute('aria-selected') == 'true') ? btnPrev.setAttribute('disabled', ''): btnPrev.removeAttribute('disabled');
            });
        }
        if (ubication.getAttribute('aria-selected') == 'true' && eve.target.id == 'next') {
            $('#next').ready(function() {
                $('#nav-info-tab ').tab('show');
                (info.getAttribute('aria-selected') == 'true') ? btnNext.setAttribute('disabled', ''): btnNext.removeAttribute('disabled');
            });
        }
        if (ubication.getAttribute('aria-selected') == 'true' && eve.target.id == 'prev') {
            $('#prev').ready(function() {
                $('#nav-image-tab ').tab('show');
            });
        }
        if (info.getAttribute('aria-selected') == 'true' && eve.target.id == 'prev') {
            $('#prev').ready(function() {
                $('#nav-ubication-tab ').tab('show');
                btnNext.removeAttribute('disabled');
            });
        }
    });

    if (notification.getAttribute('aria-selected') == 'true') {
        btnPrev.setAttribute('disabled', '');
    }
    if (info.getAttribute('aria-selected') == 'true') {
        btnNext.setAttribute('disabled', '');
    }

});