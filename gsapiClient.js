"use strict";

const gsapiClient = {
	url: "https://api.gridsound.com/",
	headers: Object.freeze( {
		"Content-Type": "application/json; charset=utf-8",
	} ),

	user: {},
	compositions: [],

	getMe() {
		return this._fetch( "GET", "getMe" )
			.then( res => this._assignMe( res ) );
	},
	login( email, pass ) {
		return this._fetch( "POST", "login", { email, pass } )
			.then( res => this._assignMe( res ) );
	},
	signup( username, email, pass ) {
		return this._fetch( "POST", "createUser", { username, email, pass } )
			.then( res => this._assignMe( res ) );
	},
	resendConfirmationEmail() {
		return this._fetch( "POST", "resendConfirmationEmail", { email: this.user.email } );
	},
	getUser( username ) {
		return this._fetch( "GET", `getUser?username=${ username }` )
			.then( ( { data } ) => {
				data.user.usernameLow = data.user.username.toLowerCase();
				return data;
			} );
	},
	logout() {
		return this._fetch( "POST", "logout", { confirm: true } )
			.then( res => this._deleteMe( res ) );
	},
	logoutRefresh() {
		return this.logout()
			.then( () => {
				setTimeout( () => location.href =
					location.origin + location.pathname, 500 );
			} );
	},
	updateMyInfo( obj ) {
		return this._fetch( "POST", "updateMyInfo", obj )
			.then( res => this._assignMe( res ) );
	},
	saveComposition( cmp ) {
		return this._fetch( "POST", "saveComposition",
			{ composition: JSON.stringify( cmp ) } );
	},

	// private:
	_assignMe( { data } ) {
		const { user, compositions } = data;

		if ( compositions ) {
			Object.assign( this.compositions, compositions );
		}
		if ( user ) {
			user.usernameLow = user.username.toLowerCase();
			user.emailpublic = user.emailpublic === "1";
			user.emailchecked = user.emailchecked === "1";
			Object.assign( this.user, user );
		}
		return data;
	},
	_deleteMe( res ) {
		Object.keys( this.user ).forEach( k => delete this.user[ k ] );
		return res;
	},
	_fetch( method, url, body ) {
		const obj = {
			method,
			headers: this.headers,
			credentials: "include",
		};

		if ( body ) {
			obj.body = JSON.stringify( body );
		}
		return fetch( this.url + url, obj )
			.then( res => res.json() )
			.then( res => this._fetchThen( res ) );
	},
	_fetchThen( res ) {
		if ( !res.ok ) {
			res.msg = this.errorCode[ res.msg ] || res.msg;
			throw( res );
		}
		return res;
	},

	errorCode: {
		"login:fail": "The email/password don't match",
		"pass:too-short": "The password is too short",
		"email:too-long": "The email is too long",
		"email:duplicate": "This email is already used",
		"email:bad-format": "The email is not correct",
		"username:too-long": "The username is too long",
		"username:too-short": "The username is too short",
		"username:duplicate": "This username is already taken",
		"username:bad-format": "The username can only contains letters, digits and _",
	},
};
