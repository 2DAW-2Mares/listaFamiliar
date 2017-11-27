'use strict';

module.exports = function(Producto) {

	/**
	 * Obtiene productos de Amazon según un criterio de búsqueda
	 * @param {string} criterio El criterio de búsqueda que enviaremos a la API de Amazon
	 * @param {Function(Error)} callback
	 */

	Producto.amazonProductos = function(criterio, callback) {
		var AWS = require('aws-sdk');
		AWS.config.update({region: 'eu-west-1'});
		var pricing = new AWS.Pricing();
		// TODO Faltan las credenciales
		var params = {
			Filters: [{
				Field: "ServiceCode",
				Type: "TERM_MATCH",
				Value: "AmazonEC2"
			}, {
				Field: "volumeType",
				Type: "TERM_MATCH",
				Value: "Provisioned IOPS"
			}],
			FormatVersion: "aws_v1",
			MaxResults: 10
		};
		pricing.getProducts(params, function(err, data) {
			if (err) callback(err); // an error occurred
			callback(null, data); // successful response
		});
	};
};
