$(function() {
  $('#map-page').html('<div class="flexslider"><ul class="slides"><li></li><li></li></ul></div><ul id="stories"></ul>');
  $('div.cover:not(.active)').remove();
  
  var screen_size = $(window).width() * window.devicePixelRatio;
  var img_size = 640;
  if (screen_size > img_size) img_size = 1136;
  if (screen_size > img_size) img_size = 2048;
  
  var stories = [];
  var stories_by_year = {};
  var stories_by_country = {};
  
  var slider;

  var menu = $('.navbar-mobile');
  var menu_toggle = $('.navbar .toggle');
  var menu_list = menu.find('ul');
  
  var story_template = $('<div id="story-page"><a href="#" class="close ss-delete"></a><h1 id="year-region"><span id="year"></span><span id="year-border">❘</span><span class="region"></span></h1><h2 id="story-head"></h2><p id="story-body"><p></div>');
  
  function update() {
    if (year = $('li.flex-active-slide:not(.clone)').attr('data-year')) {
      if (!$('#home-page').is(':visible')) $('h2.year').text(year);
      stories_list = $('#stories').html('');
      $.each(stories_by_year[year], function(key, val) {
        story = $('<a href="#">').text(val['head']).attr('data-story-id', val['id']).prepend(
          $('<em>').text(val['name'] + ': ')
        );
        stories_list.append($('<li>').append(story));
      });
    }
  };
  
  $('.navbar .toggle, h2.year').on('click', function(e) {
    toggle = !menu_toggle.is('.active');
    menu_toggle.toggleClass('active', toggle);
    menu.toggle(toggle);
  });
  
  $(document).on('click', '.navbar-mobile a', function(e) {
    e.preventDefault();
    menu_toggle.toggleClass('active', false);
    menu.hide();
    
    $('h2.year').text($(this).text());
    $('#home-page').hide();
  
    if (year = $(this).attr('data-year')) {
      $('#story-page').remove();
      $('#map-page').show().css('opacity',100);
      $('#about-page').hide();
      slider.flexAnimate($(this).parent().index()-1);
    } else {
      $('#story-page').remove();
      $('#map-page').hide();
      $('#about-page').show();
    }
  });
  
  $(document).on('click', 'a[data-story-id]', function(e) {
    $('#story-page').remove();
    story_id = $(this).attr('data-story-id');
    story = stories[story_id];
    story_item = story_template.clone();
    story_item.find('#year').text(story['year']);
    story_item.find('.region').text(story['name']);
    story_item.find('#story-head').text(story['head']);
    story_item.find('#story-body').text(story['body']);
    if ((related_stories = stories_by_country[story['name']]) && (related_stories.length > 1)) {
      story_item.append('<dl class="related"><dt>RELATED STORIES:</dt></dl>');
      $.each(related_stories, function(key, val) {
        if (val['id'] != story_id) {
          related_story = $('<a href="#">').text(val['head']).attr('data-story-id', val['id']);
          story_item.find('dl.related').append($('<dd>').append(related_story));
        }
      });
    }
    $('body').prepend(story_item);
  });
  
  $(document).on('click', '#story-page .close', function(e) {
    $('#story-page').remove();
  });
  
  /* get stories */
  $.getJSON("/data/stories.json", function(data) {
    $.each(data, function(key, val) {
      val['id'] = key;
      stories[key] = val;
      if (!stories_by_year[val['year']]) stories_by_year[val['year']] = [];
      stories_by_year[val['year']].push(val);
      if (!stories_by_country[val['name']]) stories_by_country[val['name']] = [];
      stories_by_country[val['name']].push(val);
    });
    
    update();
  });
  
  /* build slider */
  $('.flexslider').flexslider({
    animation: "slide",
    controlNav: false,
    directionNav: false,
    slideshow: false,
    touch: true,
    after: function(slider) {
      update();
    }
  });
  slider = $('.flexslider').data('flexslider');
  var template = $('<li><img class="map"><dl class="refugees"><dd class="mode-value"></dd><dt>World Refugees</dt></dl><dl class="top-values"></dl></li>');
  
  /* get data */
  $.getJSON("/data/totals.json", function(data) {
    $.each(data, function(key, val) {
      year = val['year'];
      
      menu_list.append('<li><a href="#" data-year="'+year+'">'+year+'</a></li>');
      
      slide = $('.flexslider li[data-year='+year+']');
      if (slide.length < 1) {
        slide = template.clone();
        slider.addSlide(slide);
      }
      slide.attr('data-year', year);
      slide.find('img').attr('src','imgs/maps/'+img_size+'/'+year+'.jpg');
      slide.find('.mode-value').text(val['total']);
      for (i=1;i<=3;i++) {
        slide.find('.top-values').append([
          $('<dt>').text(val['country'+i]),
          $('<dd>').text(val['country'+i+'_total'])
        ]);
      }
    });
    
    slider.removeSlide(1);
    slider.removeSlide(0);
  
    update();
  });
  
  $("#explore-button").attr("src", "imgs/explore.png").on('click', function(e) {
    $('a[data-year=1975]').click();
  });
});