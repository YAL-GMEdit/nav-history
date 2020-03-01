(function() {
	let historyBack = [];
	let historyForward = [];
	let GmlFile, GmlFile_open_base;
	function save(file) {
		let item = {
			name: file.name,
			path: file.path
		};
		if (file.codeEditor) {
			let session = file.codeEditor.session;
			item.nav = {
				selection: session.selection.toJSON(),
				scrollLeft: session.getScrollLeft(),
				scrollTop: session.getScrollTop()
			};
		}
		return item;
	}
	function restore(item) {
		let file = GmlFile_open_base(item.name, item.path, null);
		if (item.nav && file.codeEditor) window.setTimeout(function() {
			let session = file.codeEditor.session;
			let data = item.nav;
			session.setScrollLeft(data.scrollLeft);
			session.setScrollTop(data.scrollTop);
			session.selection.fromJSON(data.selection);
		});
	}
	function GmlFile_open_hook() {
		let file = GmlFile.current;
		if (file && file.path) {
			let item = save(file);
			//
			historyBack.push(item);
			if (historyBack.length > 128) historyBack.shift();
			historyForward.length = 0;
		}
		return GmlFile_open_base.apply(this, arguments);
	}
	GMEdit.register("nav-history", {
		init: function() {
			GmlFile = $gmedit["gml.file.GmlFile"];
			GmlFile_open_base = GmlFile.open;
			GmlFile.open = GmlFile_open_hook;
			AceCommands.add({
				name: "navBack",
				bindKey: {
					win: "Alt-Left",
					mac: "Alt-["
				},
				exec: function() {
					let item = historyBack.pop();
					if (item) {
						historyForward.push(save(GmlFile.current));
						restore(item);
					}
				}
			});
			AceCommands.add({
				name: "navForward",
				bindKey: {
					win: "Alt-Right",
					mac: "Alt-]"
				},
				exec: function() {
					let item = historyForward.pop();
					if (item) {
						historyBack.push(save(GmlFile.current));
						restore(item);
					}
				}
			});
			AceCommands.addToPalette({
				name: "Navigate back",
				exec: "navBack",
			});
			AceCommands.addToPalette({
				name: "Navigate forward",
				exec: "navForward",
			});
		}
	});
})();