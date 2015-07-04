// File: device-ble.js

// Load dependent library EasyBLE.
//evothings.loadScript('libs/evothings/easyble/easyble.js');

/**
 * @namespace
 * @description <p>Functions for communicating with a device BLE device.</p>
 * <p>It is safe practise to call function {@link evothings.scriptsLoaded}
 * to ensure dependent libraries are loaded before calling functions
 * in this library.</p>
 */
evothings = window.evothings || {}; 
evothings.bledevice = {};

;(function()
{
	// Internal functions.
	var internal = {};

	/**
	 * Stops any ongoing scan and disconnects any connected devices.
	 * @public
	 */
	evothings.bledevice.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/**
	 * Called when you have connected to a device board.
	 * @callback evothings.bledevice.connectsuccess
	 * @param {evothings.bledevice.ArduinoBLEDevice} device -
	 * The connected BLE shield.
	 */

	/**
	 * Connect to the device board.
	 * @param {evothings.bledevice.connectsuccess} success -
	 * Success callback: success(device)
	 * @param {function} fail - Error callback: fail(errorCode)
	 * @example
	 * evothings.bledevice.connect(
	 *   'LedButtonDemo', // BLE name
	 *   function(device)
	 *   {
	 *     console.log('connected!');
	 *     device.writeDataArray(new Uint8Array([1]));
	 *     evothings.bledevice.close();
	 *   },
	 *   function(errorCode)
	 *   {
	 *     console.log('Error: ' + errorCode);
	 *   });
	 * @public
	 */
	evothings.bledevice.connect = function(deviceName, success, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				console.log('found device: ' + device.name);
				if (device.name.indexOf(deviceName) > -1 )
				{
					evothings.easyble.stopScan();
					internal.connectToDevice(device, success, fail);
                                        global_device_data = device

				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

        /**
	 * read services from device.
	 * @param {evothings.bledevice.connectsuccess} success -
	 * Success callback: success(device)
	 * @param {function} fail - Error callback: fail(errorCode)
	 * @example
	 * evothings.bledevice.readservices(
	 *   'LedButtonDemo', // BLE name
	 *   function(device)
	 *   {
	 *     console.log('connected!');
	 *     device.writeDataArray(new Uint8Array([1]));
	 *     evothings.bledevice.close();
	 *   },
	 *   function(errorCode)
	 *   {
	 *     console.log('Error: ' + errorCode);
	 *   });
	 * @public
	 */
	evothings.bledevice.readservices = function(deviceName, services_array,success, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				console.log('found device: ' + device.name);
				if (device.name.indexOf(deviceName) > -1 )
				{
					evothings.easyble.stopScan();
					internal.connectToDevice(device, success, fail);
				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Connect to the device.
	 * @private
	 */
	internal.connectToDevice = function(device, success, fail)
	{
		device.connect(
			function(device)
			{
				console.log('connected!');
				// Get services info.
				internal.getServices(device, success, fail);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Read all services from the device.
	 * @private
	 */
	internal.getServices = function(device, success, fail)
	{
		device.readServices(
			null, // null means read info for all services
			function(device)
			{
				internal.addMethodsToDeviceObject(device);
				success(device);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Add instance methods to the device object.
	 * @private
	 */
	internal.addMethodsToDeviceObject = function(device)
	{
		/**
		 * Object that holds info about a device device.
		 * @namespace evothings.bledevice.bledeviceDevice
		 */

		/**
		 * @function writeDataArray
		 * @description Write data to a device board.
		 * @param {Uint8Array} uint8array - The data to be written.
		 * @memberof evothings.bledevice.bledeviceDevice
		 * @instance
		 * @public
		 */
		device.writeDataArray = function(uint8array)
		{
			device.writeCharacteristic(
				'00001525-1212-efde-1523-785feabcd123',
				uint8array,
				function()
				{
					console.log('writeCharacteristic success');
				},
				function(errorCode)
				{
					console.log('writeCharacteristic error: ' + errorCode);
				});
		};

		/**
		 * @function setNotification
		 * @description Set a notification callback.
		 * @param {Uint8Array} uint8array - The data to be written.
		 * @memberof evothings.bledevice.bledeviceDevice
		 * @instance
		 * @public
		 */
		device.setNotification = function(callback)
		{
			// Debug logging.
			//console.log('setNotification');

			// Must write this descriptor value to enable enableNotification().
			// Yes, it's weird.
			// Without it, enableNotification() fails silently;
			// we never get the data we should be getting.
			device.writeDescriptor('00001524-1212-efde-1523-785feabcd123',
				'00002902-0000-1000-8000-00805f9b34fb',
				new Uint8Array([1,0]),
				function() {
					console.log('writeDescriptor success');
				}, function(errorCode) {
					console.log('writeDescriptor error: ' + errorCode);
				});

			device.enableNotification('00001524-1212-efde-1523-785feabcd123',
				callback,
				function(errorCode) {
					console.log('enableNotification error: ' + errorCode);
				});
		};
	};
})();
